from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.admin import Admin
from app.schemas.knowledge import KnowledgeCreate, KnowledgeUpdate, KnowledgeResponse
from app.services.auth_service import get_current_admin
from app.services.knowledge_service import (
    get_all_knowledge_entries,
    get_knowledge_entry_by_id,
    create_knowledge_entry,
    update_knowledge_entry,
    delete_knowledge_entry
)

router = APIRouter(prefix="/admin/knowledge", tags=["Admin Knowledge Management"])


@router.get("", response_model=List[KnowledgeResponse])
def list_knowledge_entries(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search term across title, question, answer, keywords"),
    verified: Optional[bool] = Query(None, description="Filter by verified status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """List all knowledge entries with search and category filtering."""
    return get_all_knowledge_entries(
        db=db,
        category_id=category_id,
        search=search,
        verified_only=verified,
        skip=skip,
        limit=limit
    )


@router.get("/{entry_id}", response_model=KnowledgeResponse)
def get_single_knowledge_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieve knowledge entry by ID."""
    return get_knowledge_entry_by_id(db, entry_id)


@router.post("", response_model=KnowledgeResponse, status_code=status.HTTP_201_CREATED)
def create_new_knowledge_entry(
    data: KnowledgeCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Create a new verified MAIT knowledge entry in the database."""
    return create_knowledge_entry(db, data, username=current_admin.username)


@router.put("/{entry_id}", response_model=KnowledgeResponse)
def update_existing_knowledge_entry(
    entry_id: int,
    data: KnowledgeUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Update an existing knowledge entry."""
    return update_knowledge_entry(db, entry_id, data, username=current_admin.username)


@router.delete("/{entry_id}")
def delete_existing_knowledge_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Delete a knowledge entry from the database."""
    return delete_knowledge_entry(db, entry_id)
