from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Health check endpoint to verify backend status and configuration."""
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "environment": settings.APP_ENV,
        "llm_enabled": settings.LLM_ENABLED,
        "llm_provider": settings.LLM_PROVIDER
    }
