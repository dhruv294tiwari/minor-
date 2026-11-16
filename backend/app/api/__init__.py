from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.categories import router as categories_router
from app.api.knowledge import router as knowledge_router
from app.api.dashboard import router as dashboard_router
from app.api.queries import router as queries_router
from app.api.feedback import router as feedback_router

api_router = APIRouter(prefix="/api")

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(categories_router)
api_router.include_router(knowledge_router)
api_router.include_router(dashboard_router)
api_router.include_router(queries_router)
api_router.include_router(feedback_router)
