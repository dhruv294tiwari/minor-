from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class CategoryStatItem(BaseModel):
    category_id: int
    category_name: str
    entries_count: int


class RecentQueryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_query: str
    response: str
    source_type: str
    matched_entry_id: Optional[int] = None
    created_at: datetime


class RecentKnowledgeItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category_name: str
    verified: bool
    updated_at: datetime


class DashboardStatsResponse(BaseModel):
    total_entries: int
    total_categories: int
    total_verified_entries: int
    total_queries: int
    verified_queries_count: int
    ai_generated_queries_count: int
    verified_percentage: float
    total_feedbacks: int
    positive_feedbacks: int
    recent_queries: List[RecentQueryItem]
    recent_knowledge_updates: List[RecentKnowledgeItem]
    category_breakdown: List[CategoryStatItem]
