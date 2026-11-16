from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models.admin import Admin
from app.models.category import Category
from app.models.knowledge import KnowledgeEntry
from app.models.query_log import QueryLog
from app.models.feedback import Feedback
from app.schemas.dashboard import (
    DashboardStatsResponse,
    CategoryStatItem,
    RecentQueryItem,
    RecentKnowledgeItem
)
from app.services.auth_service import get_current_admin

router = APIRouter(prefix="/admin/dashboard", tags=["Admin Dashboard"])


@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Get live, real-time database-driven statistics for the admin dashboard.
    All metrics are directly queried from the SQL database.
    """
    # 1. Total counts
    total_entries = db.query(KnowledgeEntry).count()
    total_categories = db.query(Category).count()
    total_verified_entries = db.query(KnowledgeEntry).filter(KnowledgeEntry.verified == True).count()
    total_queries = db.query(QueryLog).count()

    # 2. Query breakdown
    verified_queries_count = db.query(QueryLog).filter(QueryLog.source_type == "MAIT_VERIFIED").count()
    ai_generated_queries_count = db.query(QueryLog).filter(QueryLog.source_type == "AI_GENERATED").count()

    verified_percentage = 0.0
    if total_queries > 0:
        verified_percentage = round((verified_queries_count / total_queries) * 100, 1)

    # 3. Feedback stats
    total_feedbacks = db.query(Feedback).count()
    positive_feedbacks = db.query(Feedback).filter(Feedback.rating == "helpful").count()

    # 4. Recent queries (last 10)
    recent_queries_raw = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(10).all()
    recent_queries = [
        RecentQueryItem(
            id=q.id,
            user_query=q.user_query,
            response=q.response,
            source_type=q.source_type,
            matched_entry_id=q.matched_entry_id,
            created_at=q.created_at
        )
        for q in recent_queries_raw
    ]

    # 5. Recent knowledge updates (last 10)
    recent_knowledge_raw = db.query(KnowledgeEntry).options(
        joinedload(KnowledgeEntry.category)
    ).order_by(KnowledgeEntry.updated_at.desc()).limit(10).all()

    recent_knowledge_updates = [
        RecentKnowledgeItem(
            id=k.id,
            title=k.title,
            category_name=k.category.name if k.category else "Unassigned",
            verified=k.verified,
            updated_at=k.updated_at
        )
        for k in recent_knowledge_raw
    ]

    # 6. Category breakdown
    cat_counts = db.query(
        Category.id,
        Category.name,
        func.count(KnowledgeEntry.id).label("count")
    ).outerjoin(
        KnowledgeEntry, Category.id == KnowledgeEntry.category_id
    ).group_by(Category.id, Category.name).order_by(func.count(KnowledgeEntry.id).desc()).all()

    category_breakdown = [
        CategoryStatItem(
            category_id=c[0],
            category_name=c[1],
            entries_count=c[2]
        )
        for c in cat_counts
    ]

    return DashboardStatsResponse(
        total_entries=total_entries,
        total_categories=total_categories,
        total_verified_entries=total_verified_entries,
        total_queries=total_queries,
        verified_queries_count=verified_queries_count,
        ai_generated_queries_count=ai_generated_queries_count,
        verified_percentage=verified_percentage,
        total_feedbacks=total_feedbacks,
        positive_feedbacks=positive_feedbacks,
        recent_queries=recent_queries,
        recent_knowledge_updates=recent_knowledge_updates,
        category_breakdown=category_breakdown
    )
