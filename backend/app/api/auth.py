from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse, AdminProfile, ChangePasswordRequest, UpdateProfileRequest
from app.services.auth_service import authenticate_admin, get_current_admin
from app.utils.security import create_access_token, verify_password, get_password_hash

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


@router.post("/change-password")
def change_admin_password(
    payload: ChangePasswordRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Change the password of the currently authenticated admin."""
    if not verify_password(payload.current_password, current_admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    if len(payload.new_password.strip()) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )
    current_admin.password_hash = get_password_hash(payload.new_password.strip())
    db.commit()
    return {"message": "Password changed successfully."}


@router.put("/profile", response_model=AdminProfile)
def update_admin_profile(
    payload: UpdateProfileRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update admin username and/or email."""
    if payload.username and payload.username.strip():
        new_uname = payload.username.strip()
        existing = db.query(Admin).filter(Admin.username == new_uname, Admin.id != current_admin.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already taken.")
        current_admin.username = new_uname

    if payload.email and payload.email.strip():
        new_email = payload.email.strip()
        existing = db.query(Admin).filter(Admin.email == new_email, Admin.id != current_admin.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already in use.")
        current_admin.email = new_email

    db.commit()
    db.refresh(current_admin)
    return AdminProfile.model_validate(current_admin)
