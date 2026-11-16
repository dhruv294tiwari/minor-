from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.admin import Admin
from app.models.feedback import Feedback
from app.models.query_log import QueryLog
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackDetailResponse
from app.services.auth_service import get_current_admin

router = APIRouter(tags=["Feedback"])


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_query_feedback(data: FeedbackCreate, db: Session = Depends(get_db)):
    """Submit student feedback (thumbs-up / thumbs-down + optional comment) for a query."""
    query_log = db.query(QueryLog).filter(QueryLog.id == data.query_log_id).first()
    if not query_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced query log was not found"
        )

    feedback = Feedback(
        query_log_id=data.query_log_id,
        rating=data.rating,
        comment=data.comment.strip() if data.comment and data.comment.strip() else None
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/admin/feedback", response_model=List[FeedbackDetailResponse])
def list_feedbacks(
    rating: Optional[str] = Query(None, description="Filter by helpful or unhelpful"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """List all student feedbacks with associated query details (Admin only)."""
    query = db.query(Feedback).options(joinedload(Feedback.query_log))

    if rating:
        query = query.filter(Feedback.rating == rating)

    feedbacks_raw = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for f in feedbacks_raw:
        item = FeedbackDetailResponse(
            id=f.id,
            query_log_id=f.query_log_id,
            rating=f.rating,
            comment=f.comment,
            created_at=f.created_at,
            user_query=f.query_log.user_query if f.query_log else None,
            response=f.query_log.response if f.query_log else None,
            source_type=f.query_log.source_type if f.query_log else None
        )
        result.append(item)

    return result
