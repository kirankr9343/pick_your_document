from fastapi import APIRouter
from app.core.config import settings
from app.schemas.schemas import HealthResponse

router = APIRouter()

@router.get("", response_model=HealthResponse)
async def get_health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.APP_ENV,
        services={
            "api": "online",
            "database": "online",
            "storage": "online",
            "ocr_provider": settings.OCR_PROVIDER,
            "ai_provider": settings.AI_PROVIDER
        }
    )
