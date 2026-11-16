from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class FeedbackCreate(BaseModel):
    query_log_id: int
    rating: Literal["helpful", "unhelpful"]
    comment: Optional[str] = Field(None, max_length=1000)


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    query_log_id: int
    rating: str
    comment: Optional[str] = None
    created_at: datetime


class FeedbackDetailResponse(FeedbackResponse):
    user_query: Optional[str] = None
    response: Optional[str] = None
    source_type: Optional[str] = None
