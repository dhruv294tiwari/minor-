from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.admin import Admin
from app.models.query_log import QueryLog
from app.schemas.dashboard import RecentQueryItem
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/admin/queries", tags=["Admin Query Logs"])


@router.get("", response_model=List[RecentQueryItem])
def list_student_queries(
    source_type: Optional[str] = Query(None, description="Filter by MAIT_VERIFIED or AI_GENERATED"),
    search: Optional[str] = Query(None, description="Search query or response content"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieve student query logs with source type and keyword filtering."""
    query = db.query(QueryLog)

    if source_type and source_type.strip():
        query = query.filter(QueryLog.source_type == source_type.strip())
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (QueryLog.user_query.ilike(term)) |
            (QueryLog.response.ilike(term))
        )

    return query.order_by(QueryLog.created_at.desc()).offset(skip).limit(limit).all()
