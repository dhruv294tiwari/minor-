from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.admin import Admin
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryWithCountResponse
from app.services.auth_service import get_current_admin
from app.services.knowledge_service import (
    get_all_categories_with_count,
    get_category_by_id,
    create_category,
    update_category,
    delete_category
)

router = APIRouter(tags=["Categories"])


# --- Public endpoint ---
@router.get("/categories", response_model=List[CategoryWithCountResponse])
def list_public_categories(db: Session = Depends(get_db)):
    """List all categories with active entry counts (Public)."""
    return get_all_categories_with_count(db)


# --- Protected Admin Endpoints ---
@router.get("/admin/categories", response_model=List[CategoryWithCountResponse])
def list_admin_categories(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """List all categories with active entry counts (Admin)."""
    return get_all_categories_with_count(db)


@router.get("/admin/categories/{category_id}", response_model=CategoryResponse)
def get_single_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieve category by ID."""
    return get_category_by_id(db, category_id)


@router.post("/admin/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_new_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Create a new category in the database."""
    return create_category(db, data)


@router.put("/admin/categories/{category_id}", response_model=CategoryResponse)
def update_existing_category(
    category_id: int,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Update an existing category's name or description."""
    return update_category(db, category_id, data)


@router.delete("/admin/categories/{category_id}")
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Safely delete a category. Rejected if active knowledge entries are present."""
    return delete_category(db, category_id)
