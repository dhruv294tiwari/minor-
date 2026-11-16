import re
import logging
from abc import ABC, abstractmethod
from typing import Optional, List
import httpx
from app.config import settings
from app.prompts.assistant_prompt import SYSTEM_PROMPT, build_verified_prompt, build_fallback_prompt

logger = logging.getLogger("mait_assistant.llm")


def clean_reasoning_tags(text: str) -> str:
    """Remove <think>...</think> blocks from reasoning models like Qwen / DeepSeek."""
    if not text:
        return ""
    
    # 1. Remove all closed <think>...</think> blocks
    cleaned = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.DOTALL)
    
    # 2. If there is still an unclosed <think> block, remove it and everything after it
    if '<think>' in cleaned:
        cleaned = cleaned.split('<think>')[0]
        
    cleaned = cleaned.strip()
    
    # If the response is empty (meaning the model only produced reasoning, e.g. if cut off),
    # return a helpful fallback message instead of leaking the thinking process.
    if not cleaned:
        return (
            "I do not have an exact verified institutional notice regarding this specific inquiry in the MAIT knowledge base. "
            "However, from a general engineering college perspective, students are advised to consult the respective department "
            "HOD office, academic coordinator, or the official institute website at **mait.ac.in** for official circulars and notices."
        )
        
    return cleaned


class BaseLLMProvider(ABC):
    """Abstract Base Class for LLM providers."""

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: str = SYSTEM_PROMPT
    ) -> str:
        """Generate response given a prompt and system instruction."""
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Intelligent Mock LLM Provider for offline local development and testing.
    Produces high quality, context-aware responses using retrieved data or general academic logic.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str = SYSTEM_PROMPT
    ) -> str:
        prompt_lower = prompt.lower()

        # Check if verified records were provided in the prompt
        if "VERIFIED MAIT KNOWLEDGE DATABASE RECORDS:" in prompt:
            try:
                records_part = prompt.split("VERIFIED MAIT KNOWLEDGE DATABASE RECORDS:")[1]
                records_text = records_part.split("----------------------------------------")[1].strip()

                # Split entries by "• Category:"
                entries_raw = records_text.split("• Category:")
                main_answer = ""
                main_title = ""

                for entry_str in entries_raw:
                    if not entry_str.strip():
                        continue
                    lines = [l.strip() for l in entry_str.split("\n") if l.strip()]
                    title_val = ""
                    ans_val = ""
                    for line in lines:
                        if line.startswith("Title:"):
                            title_val = line.replace("Title:", "").strip()
                        elif line.startswith("Answer:"):
                            ans_val = line.replace("Answer:", "").strip()

                    if ans_val and not main_answer:
                        main_answer = ans_val
                        main_title = title_val
                        break

                if main_answer:
                    return f"{main_answer}"
                return f"According to official MAIT records:\n\n{records_text}"
            except Exception:
                return "Based on verified MAIT records:\n" + prompt

        # General AI fallback responses
        if any(term in prompt_lower for term in ["placement", "package", "salary", "recruiter", "company", "companies", "hire", "hiring"]):
            return (
                "Based on MAIT's general placement trends:\n\n"
                "• **Top Packages**: Highest packages generally range between ₹35–45+ LPA offered by top tech firms.\n"
                "• **Average Package**: Average packages across CSE/IT branches hover around ₹8.5–10 LPA.\n"
                "• **Major Recruiters**: Amazon, Microsoft, Google, Infosys, TCS, Cognizant, Wipro, Accenture, Deloitte, and prominent startups.\n"
                "• **Placement Cell**: The Training & Placement Cell (T&P) conducts annual campus drives for final and pre-final year students.\n\n"
                "*(Note: For the official audited placement reports and latest batch brochures, please refer to the Training & Placement section on mait.ac.in)*"
            )

        if any(term in prompt_lower for term in ["backlog", "supplementary", "reappear", "compartment"]):
            return (
                "A **backlog** occurs when a student does not secure passing marks in a particular semester course "
                "or was absent during the examination. A **supplementary exam** (or reappear examination) is a special "
                "re-test opportunity granted by the university/institute enabling students to clear their uncleared courses "
                "without repeating the entire academic term.\n\n"
                "• **Key Difference**: A backlog is the academic status of an uncleared subject, whereas a supplementary exam is the examination mechanism used to clear it.\n"
                "• **Academic Advice**: Prepare the prescribed syllabus thoroughly and register for reappear forms as announced in official semester notifications."
            )

        if any(term in prompt_lower for term in ["cgpa", "sgpa", "percentage", "calculate"]):
            return (
                "In standard GGSIPU / engineering collegiate grading systems:\n"
                "• **SGPA (Semester Grade Point Average)** reflects academic performance in a specific semester.\n"
                "• **CGPA (Cumulative Grade Point Average)** represents cumulative performance across all completed semesters.\n"
                "• **Conversion Formula**: Generally, Percentage ≈ CGPA × 10 (or as specified on your official grade card by the examination division)."
            )

        if any(term in prompt_lower for term in ["resume", "interview", "placement prep", "coding", "dsa"]):
            return (
                "To prepare effectively for campus placements and technical interviews:\n"
                "1. **Core Data Structures & Algorithms**: Practice Arrays, Strings, Trees, Graphs, and DP on LeetCode/GeeksforGeeks.\n"
                "2. **Core CS Fundamentals**: Revise DBMS, Operating Systems, Computer Networks, and Object-Oriented Programming (OOP).\n"
                "3. **Projects**: Build 2-3 substantial full-stack or domain-specific projects with clean GitHub code.\n"
                "4. **Mock Interviews**: Practice articulating your thought process clearly."
            )

        return (
            "I do not have an exact verified institutional notice regarding this specific inquiry in the MAIT knowledge base. "
            "However, from a general engineering college perspective, students are advised to consult the respective department "
            "HOD office, academic coordinator, or the official institute website at **mait.ac.in** for official circulars and notices."
        )


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini API Provider using Gemini REST API."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str = SYSTEM_PROMPT
    ) -> str:
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
            }
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.endpoint, json=payload)
            if response.status_code != 200:
                logger.error(f"Gemini API Error {response.status_code}: {response.text}")
                raise RuntimeError(f"Gemini API returned error code {response.status_code}")

            data = response.json()
            try:
                candidates = data.get("candidates", [])
                if candidates:
                    text = candidates[0]["content"]["parts"][0]["text"]
                    return clean_reasoning_tags(text)
                return "Unable to generate response from Gemini API."
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing Gemini response: {e}")
                raise RuntimeError("Failed to parse Gemini API response.")


class OpenAILLMProvider(BaseLLMProvider):
    """OpenAI and OpenAI-compatible (Groq, Together, Ollama) API Provider."""

    def __init__(
        self,
        api_key: str,
        model_name: str = "gpt-4o-mini",
        endpoint: str = "https://api.openai.com/v1/chat/completions"
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.endpoint = endpoint

    async def generate_response(
        self,
        prompt: str,
        system_instruction: str = SYSTEM_PROMPT
    ) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 2048
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            if response.status_code != 200:
                logger.error(f"LLM API Error {response.status_code}: {response.text}")
                raise RuntimeError(f"LLM API returned error code {response.status_code}: {response.text}")

            data = response.json()
            try:
                raw_content = data["choices"][0]["message"]["content"]
                return clean_reasoning_tags(raw_content)
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing LLM response: {e}")
                raise RuntimeError("Failed to parse LLM API response.")


def get_llm_provider() -> BaseLLMProvider:
    """Factory function returning the configured LLM provider with graceful fallback."""
    if not settings.LLM_ENABLED or not settings.LLM_API_KEY or settings.LLM_API_KEY.startswith("YOUR_"):
        return MockLLMProvider()

    provider_name = (settings.LLM_PROVIDER or "").lower().strip()
    api_key = settings.LLM_API_KEY.strip()
    model_name = settings.LLM_MODEL or "qwen/qwen3.6-27b"

    # Auto-detect Groq keys (start with gsk_) or explicit groq provider
    if api_key.startswith("gsk_") or provider_name == "groq":
        endpoint = settings.LLM_BASE_URL or "https://api.groq.com/openai/v1/chat/completions"
        logger.info(f"Using Groq Provider with model '{model_name}' and endpoint '{endpoint}'")
        return OpenAILLMProvider(api_key=api_key, model_name=model_name, endpoint=endpoint)

    if provider_name == "gemini":
        return GeminiLLMProvider(api_key=api_key, model_name=model_name)
    elif provider_name in ["openai", "custom"]:
        endpoint = settings.LLM_BASE_URL or "https://api.openai.com/v1/chat/completions"
        return OpenAILLMProvider(api_key=api_key, model_name=model_name, endpoint=endpoint)
    else:
        return MockLLMProvider()
