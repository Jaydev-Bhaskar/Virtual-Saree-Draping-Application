"""
FastAPI application entry point.
Virtual Fashion Try-On Backend API.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import database
from app.core.logging_config import setup_logging
from app.core.rate_limiter import RateLimitMiddleware
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.api import auth, uploads, clothing, tryon, recommendations, feedback

import logging


# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown events."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await database.connect()

    # Ensure upload directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "users"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "clothing"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "tryon"), exist_ok=True)

    logger.info("Application started successfully")
    yield

    # Shutdown
    logger.info("Shutting down application...")
    await database.disconnect()
    logger.info("Application stopped")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-powered Virtual Fashion Try-On API. "
        "Upload your photo, select clothing items, and generate "
        "virtual try-on previews with AI recommendations."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ─── Middleware ───────────────────────────────────────────────────────────────

# Rate limiting (Disabled for production stability testing)
# app.add_middleware(RateLimitMiddleware)

# CORS (Register LAST to be the outermost layer)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers ─────────────────────────────────────────────────────

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ─── Static Files (uploaded images) ─────────────────────────────────────────

# Mount uploads directory for serving static files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)

from app.api import auth, uploads, clothing, tryon, recommendations, feedback, lookbook

# ─── API Routes ──────────────────────────────────────────────────────────────

API_V1_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(uploads.router, prefix=API_V1_PREFIX)
app.include_router(clothing.router, prefix=API_V1_PREFIX)
app.include_router(tryon.router, prefix=API_V1_PREFIX)
app.include_router(recommendations.router, prefix=API_V1_PREFIX)
app.include_router(feedback.router, prefix=API_V1_PREFIX)
app.include_router(lookbook.router, prefix=f"{API_V1_PREFIX}/lookbook", tags=["Lookbook"])


# ─── Root & Health Endpoints ─────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """API root - returns basic info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "api_prefix": API_V1_PREFIX,
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring and deployment."""
    try:
        # Verify MongoDB connection
        await database.client.admin.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.APP_VERSION,
    }


# ─── Run with Uvicorn ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
