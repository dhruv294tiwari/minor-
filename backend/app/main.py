import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered
from app.api import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("mait_assistant")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("MAIT AI College Information Assistant backend initialized.")
    yield
    logger.info("Shutting down backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Official AI-Powered College Information Assistant for Maharaja Agrasen Institute of Technology (MAIT), New Delhi. "
        "Delivers verified institutional information with high priority, supported by LLM natural language understanding "
        "and general AI fallback."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include API Router
app.include_router(api_router)


@app.get("/")
def root_info():
    return {
        "message": "Welcome to Maharaja Agrasen Institute of Technology (MAIT) AI Assistant API",
        "documentation": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
