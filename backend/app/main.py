import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.core.security import cleanup_expired_files
from app.api.v1.router import api_router

async def periodic_cleanup_task():
    """Background task that periodically cleans up expired files."""
    while True:
        try:
            cleanup_expired_files()
        except Exception:
            pass
        await asyncio.sleep(3600)  # Every hour

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    await init_db()
    cleanup_task = asyncio.create_task(periodic_cleanup_task())
    yield
    # Shutdown actions
    cleanup_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Pick Your Document - All-in-One Document Utility and AI Platform Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing your request. Please try again later."
        }
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0"
    }
