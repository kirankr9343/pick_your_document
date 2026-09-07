from fastapi import APIRouter
from app.api.v1.endpoints import converters, pdf, ai, download, auth, admin, health

api_router = APIRouter()

api_router.include_router(converters.router, prefix="/convert", tags=["converters"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(download.router, prefix="/download", tags=["download"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
