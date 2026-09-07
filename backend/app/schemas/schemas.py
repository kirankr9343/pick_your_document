from typing import Optional, List, Any, Dict
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
    processing_time_ms: Optional[float] = 0.0
    download_url: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    user_email: Optional[str] = None

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
    role: str = "USER"
    status: str = "active"
    is_admin: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Admin Management Schemas
class RoleUpdateSchema(BaseModel):
    role: str = Field(..., description="USER, ADMIN, or SUPER_ADMIN")

class StatusUpdateSchema(BaseModel):
    status: str = Field(..., description="active or disabled")

class ToolStatusResponse(BaseModel):
    tool_id: str
    enabled: bool
    category: str
    usage_count: int
    success_count: int
    failed_count: int
    total_processing_time_ms: float
    avg_processing_time_ms: float
    updated_at: datetime

class ToolToggleSchema(BaseModel):
    enabled: bool

class AdminAuditLogResponse(BaseModel):
    id: str
    admin_user_id: str
    admin_email: str
    action: str
    target_type: str
    target_id: str
    metadata_json: Optional[str] = None
    created_at: datetime

class PaginatedUsersResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class PaginatedJobsResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class PaginatedAuditLogsResponse(BaseModel):
    logs: List[AdminAuditLogResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class AdminDashboardMetrics(BaseModel):
    total_users: int
    new_users_today: int
    total_conversions: int
    conversions_today: int
    successful_conversions: int
    failed_conversions: int
    success_rate_percent: float
    total_file_size_mb: float
    average_processing_time_sec: float
    active_jobs: int
    expired_files_count: int
    top_tools: List[Dict[str, Any]]
