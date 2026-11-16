from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse, AdminProfile
from app.services.auth_service import authenticate_admin, get_current_admin
from app.utils.security import create_access_token

router = APIRouter(prefix="/admin", tags=["Admin Auth"])


@router.post("/login", response_model=TokenResponse)
def login_for_access_token(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT access token."""
    admin = authenticate_admin(db, payload.username.strip(), payload.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "admin_id": admin.id},
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        admin=AdminProfile.model_validate(admin)
    )


@router.get("/me", response_model=AdminProfile)
def get_current_admin_profile(current_admin: Admin = Depends(get_current_admin)):
    """Get the currently authenticated admin profile."""
    return AdminProfile.model_validate(current_admin)
