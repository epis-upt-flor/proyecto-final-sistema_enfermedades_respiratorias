"""
RespiCare AI Services - Main FastAPI Application
Medical History Processing and Symptom Analysis
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
import os
from contextlib import asynccontextmanager

from api.routes import medical_history, symptom_analyzer, health
from core.config import settings
from core.database import init_database
from core.cache import init_cache

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting RespiCare AI Services...")
    
    # Initialize database connection
    await init_database()
    logger.info("Database connection initialized")
    
    # Initialize cache
    await init_cache()
    logger.info("Cache initialized")
    
    # Load AI models
    from models.model_manager import ModelManager
    model_manager = ModelManager()
    await model_manager.load_models()
    logger.info("AI models loaded")
    
    yield
    
    # Shutdown
    logger.info("Shutting down RespiCare AI Services...")


# Create FastAPI application
app = FastAPI(
    title="RespiCare AI Services",
    description="AI-powered medical history processing and symptom analysis for respiratory care",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(medical_history.router, prefix="/api/v1", tags=["medical-history"])
app.include_router(symptom_analyzer.router, prefix="/api/v1", tags=["symptom-analyzer"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RespiCare AI Services",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
