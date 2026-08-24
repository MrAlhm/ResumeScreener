import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.api import resumes, jobs, screening, candidates, analytics, seed

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart-resume-screener")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    logger.info("Initializing database tables for real-time operation...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized.")
    yield
    # Shutdown
    logger.info("Shutting down Smart Resume Screener...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI-powered Resume Screener & Candidate-Job Semantic Matching Engine",
    lifespan=lifespan
)

# Configure Wildcard CORS for seamless cross-origin communication on Render, Vercel, and local
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": f"Server error: {str(exc)}"
            }
        }
    )

# Include Routers
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(screening.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(seed.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "mode": "real-time",
        "llm_provider": settings.LLM_PROVIDER
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Resume Screener API (Real-Time Mode)",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
