from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.category import Category
from app.models.knowledge import KnowledgeEntry
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.knowledge import KnowledgeCreate, KnowledgeUpdate


# ----------------------------------------------------
# CATEGORY SERVICES
# ----------------------------------------------------

def get_all_categories_with_count(db: Session) -> List[dict]:
    """Retrieve all categories along with the count of active knowledge entries."""
    categories = db.query(
        Category,
        func.count(KnowledgeEntry.id).label("entries_count")
    ).outerjoin(
        KnowledgeEntry, Category.id == KnowledgeEntry.category_id
    ).group_by(Category.id).order_by(Category.name.asc()).all()

    result = []
    for cat, count in categories:
        result.append({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "created_at": cat.created_at,
            "updated_at": cat.updated_at,
            "entries_count": count
        })
    return result


def get_category_by_id(db: Session, category_id: int) -> Category:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def create_category(db: Session, data: CategoryCreate) -> Category:
    existing = db.query(Category).filter(Category.name.ilike(data.name.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{data.name}' already exists"
        )
    category = Category(
        name=data.name.strip(),
        description=data.description.strip() if data.description else None
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = get_category_by_id(db, category_id)
    if data.name is not None:
        name_clean = data.name.strip()
        existing = db.query(Category).filter(
            Category.name.ilike(name_clean),
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{name_clean}' already exists"
            )
        category.name = name_clean
    if data.description is not None:
        category.description = data.description.strip() if data.description else None

    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> dict:
    """Safe deletion of category. Prevents deletion if entries exist in this category."""
    category = get_category_by_id(db, category_id)

    entries_count = db.query(KnowledgeEntry).filter(KnowledgeEntry.category_id == category_id).count()
    if entries_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{category.name}' because it contains {entries_count} knowledge entries. Please reassign or delete the entries first."
        )

    db.delete(category)
    db.commit()
    return {"message": f"Category '{category.name}' deleted successfully", "id": category_id}


# ----------------------------------------------------
# KNOWLEDGE ENTRY SERVICES
# ----------------------------------------------------

def get_all_knowledge_entries(
    db: Session,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    verified_only: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> List[KnowledgeEntry]:
    query = db.query(KnowledgeEntry).options(joinedload(KnowledgeEntry.category))

    if category_id:
        query = query.filter(KnowledgeEntry.category_id == category_id)
    if verified_only is not None:
        query = query.filter(KnowledgeEntry.verified == verified_only)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (KnowledgeEntry.title.ilike(term)) |
            (KnowledgeEntry.question.ilike(term)) |
            (KnowledgeEntry.answer.ilike(term)) |
            (KnowledgeEntry.keywords.ilike(term))
        )

    return query.order_by(KnowledgeEntry.updated_at.desc()).offset(skip).limit(limit).all()


def get_knowledge_entry_by_id(db: Session, entry_id: int) -> KnowledgeEntry:
    entry = db.query(KnowledgeEntry).options(joinedload(KnowledgeEntry.category)).filter(KnowledgeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge entry not found")
    return entry


def create_knowledge_entry(db: Session, data: KnowledgeCreate, username: str = "admin") -> KnowledgeEntry:
    # Ensure category exists
    get_category_by_id(db, data.category_id)

    entry = KnowledgeEntry(
        category_id=data.category_id,
        title=data.title.strip(),
        question=data.question.strip(),
        answer=data.answer.strip(),
        keywords=data.keywords.strip() if data.keywords else None,
        source=data.source.strip() if data.source else "Official MAIT Notice",
        source_url=data.source_url.strip() if data.source_url else None,
        verified=data.verified,
        created_by=username,
        updated_by=username
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return get_knowledge_entry_by_id(db, entry.id)


def update_knowledge_entry(db: Session, entry_id: int, data: KnowledgeUpdate, username: str = "admin") -> KnowledgeEntry:
    entry = get_knowledge_entry_by_id(db, entry_id)

    if data.category_id is not None:
        get_category_by_id(db, data.category_id)
        entry.category_id = data.category_id
    if data.title is not None:
        entry.title = data.title.strip()
    if data.question is not None:
        entry.question = data.question.strip()
    if data.answer is not None:
        entry.answer = data.answer.strip()
    if data.keywords is not None:
        entry.keywords = data.keywords.strip() if data.keywords else None
    if data.source is not None:
        entry.source = data.source.strip() if data.source else None
    if data.source_url is not None:
        entry.source_url = data.source_url.strip() if data.source_url else None
    if data.verified is not None:
        entry.verified = data.verified

    entry.updated_by = username
    db.commit()
    db.refresh(entry)
    return get_knowledge_entry_by_id(db, entry.id)


def delete_knowledge_entry(db: Session, entry_id: int) -> dict:
    entry = get_knowledge_entry_by_id(db, entry_id)
    db.delete(entry)
    db.commit()
    return {"message": f"Knowledge entry '{entry.title}' deleted successfully", "id": entry_id}
