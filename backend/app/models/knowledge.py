from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class KnowledgeEntry(Base):
    __tablename__ = "knowledge_entries"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    title = Column(String(200), index=True, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    keywords = Column(Text, nullable=True)  # Comma-separated search keywords
    source = Column(String(255), nullable=True, default="Official MAIT Notice")
    source_url = Column(String(500), nullable=True)
    verified = Column(Boolean, default=True, nullable=False, index=True)
    created_by = Column(String(100), nullable=True, default="admin")
    updated_by = Column(String(100), nullable=True, default="admin")
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="knowledge_entries")
    query_logs = relationship("QueryLog", back_populates="matched_entry")
