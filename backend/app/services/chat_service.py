import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.query_log import QueryLog
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.retrieval_service import search_verified_knowledge
from app.services.llm_service import get_llm_provider
from app.prompts.assistant_prompt import build_verified_prompt, build_fallback_prompt

logger = logging.getLogger("mait_assistant.chat")


async def process_chat_query(db: Session, request: ChatRequest) -> ChatResponse:
    """
    Main Chat Processing Workflow:
    1. Understand user query & search verified SQL database.
    2. If relevant verified information exists:
       - Use verified data
       - LLM synthesizes natural answer strictly from verified facts
       - Source: MAIT_VERIFIED
    3. If no verified information exists:
       - LLM generates general guidance / answer
       - Source: AI_GENERATED
    4. Persist query & response to QueryLog.
    5. Return clean JSON response.
    """
    raw_query = request.query.strip()
    llm_provider = get_llm_provider()

    # Search verified knowledge database
    matched_results = search_verified_knowledge(db, raw_query, limit=3, threshold=6.0)

    if matched_results:
        # Verified match found
        top_entry, top_score = matched_results[0]
        logger.info(f"Verified match found for query '{raw_query}': ID={top_entry.id}, Title='{top_entry.title}', Score={top_score}")

        # Format records for prompt
        records_formatted = []
        for entry, score in matched_results:
            cat_name = entry.category.name if entry.category else "General"
            rec_str = (
                f"• Category: {cat_name}\n"
                f"  Title: {entry.title}\n"
                f"  Question/Topic: {entry.question}\n"
                f"  Answer: {entry.answer}\n"
                f"  Source: {entry.source or 'Official MAIT Notice'}\n"
                f"  Source URL: {entry.source_url or 'N/A'}"
            )
            records_formatted.append(rec_str)

        records_text = "\n\n".join(records_formatted)
        prompt = build_verified_prompt(raw_query, records_text, request.history)

        try:
            answer = await llm_provider.generate_response(prompt)
        except Exception as e:
            logger.error(f"LLM generation failed: {e}. Falling back to direct database answer.")
            answer = f"According to official MAIT records:\n\n{top_entry.answer}"

        source_type = "MAIT_VERIFIED"
        matched_id = top_entry.id
        source_title = top_entry.title
        source_citation = top_entry.source
        source_url = top_entry.source_url
        confidence = min(1.0, round(top_score / 20.0, 2))
    else:
        # No verified information found -> LLM Fallback
        logger.info(f"No verified match found for query '{raw_query}'. Using general AI fallback.")
        prompt = build_fallback_prompt(raw_query, request.history)

        try:
            answer = await llm_provider.generate_response(prompt)
        except Exception as e:
            logger.error(f"LLM fallback generation failed: {e}")
            answer = (
                "I don't have verified institutional information regarding this specific query in the current "
                "MAIT knowledge database. Please consult the official MAIT website at **mait.ac.in** or contact "
                "the college administration."
            )

        source_type = "AI_GENERATED"
        matched_id = None
        source_title = None
        source_citation = "General Academic Knowledge"
        source_url = None
        confidence = 0.5

    # Store query log in database
    query_log = QueryLog(
        user_query=raw_query,
        response=answer,
        source_type=source_type,
        matched_entry_id=matched_id
    )
    db.add(query_log)
    db.commit()
    db.refresh(query_log)

    return ChatResponse(
        answer=answer,
        source=source_type,
        query_log_id=query_log.id,
        matched_entry_id=matched_id,
        confidence=confidence,
        source_title=source_title,
        source_citation=source_citation,
        source_url=source_url
    )
