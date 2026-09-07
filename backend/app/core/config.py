import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pick Your Document"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Security & Storage
    SECRET_KEY: str = "SUPER_SECRET_PRODUCTION_KEY_PICK_YOUR_DOCUMENT_2026_CHANGE_ME"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    MAX_FILE_SIZE_MB: int = 50
    TEMP_STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "temp")
    FILE_EXPIRY_HOURS: int = 2

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./pick_your_document.db"

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # Rate Limits
    ANONYMOUS_REQUESTS_PER_HOUR: int = 60
    AUTHENTICATED_REQUESTS_PER_HOUR: int = 300

    # AI Configuration
    AI_PROVIDER: str = "heuristic"  # openai, gemini, anthropic, heuristic
    AI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o-mini"

    # OCR Configuration
    OCR_PROVIDER: str = "tesseract"  # tesseract, easyocr, fallback

    # Monetization & Analytics
    ADSENSE_ENABLED: bool = False
    ADSENSE_CLIENT_ID: str = ""
    ANALYTICS_ENABLED: bool = True
    ANALYTICS_ID: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(settings.TEMP_STORAGE_DIR, exist_ok=True)
