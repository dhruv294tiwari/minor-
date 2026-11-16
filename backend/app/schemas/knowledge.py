from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.category import CategoryResponse


class KnowledgeBase(BaseModel):
    category_id: int
    title: str = Field(..., min_length=2, max_length=200)
    question: str = Field(..., min_length=2)
    answer: str = Field(..., min_length=2)
    keywords: Optional[str] = None
    source: Optional[str] = "Official MAIT Notice"
    source_url: Optional[str] = None
    verified: bool = True


class KnowledgeCreate(KnowledgeBase):
    pass


class KnowledgeUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    question: Optional[str] = Field(None, min_length=2)
    answer: Optional[str] = Field(None, min_length=2)
    keywords: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    verified: Optional[bool] = None


class KnowledgeResponse(KnowledgeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: Optional[str] = "admin"
    updated_by: Optional[str] = "admin"
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
