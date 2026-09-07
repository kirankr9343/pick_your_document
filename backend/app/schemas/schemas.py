from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    services: dict

class StandardResponse(BaseModel):
    success: bool
    message: str
    job_id: Optional[str] = None
    download_url: Optional[str] = None
    error_code: Optional[str] = None

class JobResponse(BaseModel):
    id: str
    tool_type: str
    input_filename: str
    output_filename: Optional[str] = None
    status: str
    file_size: int
    download_url: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class OcrResultResponse(StandardResponse):
    extracted_text: str
    word_count: int

class CompressPdfResultResponse(StandardResponse):
    original_size: int
    compressed_size: int
    saved_bytes: int
    percentage_saved: float

class AiSummaryOutput(BaseModel):
    summary: str
    key_points: List[str]
    important_terms: List[str]
    action_items: List[str]
    questions_to_review: List[str]

class AiSummaryResultResponse(StandardResponse):
    summary_data: AiSummaryOutput

class SplitPdfRequest(BaseModel):
    page_ranges: str = Field(..., description="Page ranges e.g. '1-3, 5, 8-10'")

# User & Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    is_admin: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Admin Stats Schema
class AdminStatsResponse(BaseModel):
    total_users: int
    total_conversions: int
    conversions_today: int
    failed_conversions: int
    average_processing_time: float
    total_file_size_mb: float
    top_tools: List[dict]
    system_health: dict
