from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    source_type = Column(String(50), nullable=False, index=True)  # "MAIT_VERIFIED" or "AI_GENERATED"
    matched_entry_id = Column(Integer, ForeignKey("knowledge_entries.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    # Relationships
    matched_entry = relationship("KnowledgeEntry", back_populates="query_logs")
    feedbacks = relationship("Feedback", back_populates="query_log", cascade="all, delete-orphan")
