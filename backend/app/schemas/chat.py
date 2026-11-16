from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    conversation_id: Optional[str] = None
    history: Optional[List[ChatHistoryItem]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    source: Literal["MAIT_VERIFIED", "AI_GENERATED"]
    query_log_id: Optional[int] = None
    matched_entry_id: Optional[int] = None
    confidence: Optional[float] = None
    source_title: Optional[str] = None
    source_citation: Optional[str] = None
    source_url: Optional[str] = None
