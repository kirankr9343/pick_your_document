import os
import uuid
import time
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import validate_file_security, generate_random_storage_path, decode_access_token
from app.models.models import User, ProcessingJob, UsageRecord, ToolStatus

from fastapi import UploadFile, HTTPException, status, Depends, Cookie

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    access_token_cookie: Optional[str] = Cookie(None, alias="access_token"),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    auth_token = token or access_token_cookie
    if not auth_token:
        return None
    payload = decode_access_token(auth_token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user and user.status == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled by site administrators."
        )
    return user

async def get_current_admin(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required to access admin resources."
        )
    if current_user.status == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled."
        )
    is_admin_role = current_user.role in ("ADMIN", "SUPER_ADMIN") or current_user.is_admin
    if not is_admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin privileges required."
        )
    return current_user

async def get_current_super_admin(current_user: User = Depends(get_current_admin)) -> User:
    if current_user.role != "SUPER_ADMIN" and current_user.email.lower() != settings.INITIAL_ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Super Admin privileges required."
        )
    return current_user

async def check_tool_enabled(tool_id: str, db: AsyncSession) -> bool:
    """Verifies that a conversion tool is currently enabled in the database."""
    result = await db.execute(select(ToolStatus).where(ToolStatus.tool_id == tool_id))
    tool_status = result.scalars().first()
    if tool_status and not tool_status.enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"The '{tool_id}' tool has been temporarily disabled by site administrators."
        )
    return True

async def save_uploaded_file(file: UploadFile) -> Tuple[str, str, int]:
    """
    Saves an uploaded file safely after validating file size & extension.
    Returns (sanitized_original_filename, internal_temp_filepath, file_size_bytes).
    """
    content = await file.read()
    file_size = len(content)
    
    sanitized_name = validate_file_security(file.filename or "file", file_size, file.content_type)
    ext = sanitized_name.split(".")[-1] if "." in sanitized_name else "tmp"
    
    _, temp_path = generate_random_storage_path(ext)
    
    with open(temp_path, "wb") as f:
        f.write(content)

    return sanitized_name, temp_path, file_size

async def record_job_and_usage(
    db: AsyncSession,
    tool_type: str,
    input_filename: str,
    output_filename: str,
    output_path: str,
    file_size: int,
    start_time: float,
    user_id: Optional[str] = None
) -> Tuple[ProcessingJob, str]:
    """Records job completion and usage analytics in DB."""
    download_token = uuid.uuid4().hex
    processing_time_sec = time.time() - start_time
    processing_time_ms = processing_time_sec * 1000.0
    expires_at = datetime.utcnow() + timedelta(hours=settings.FILE_EXPIRY_HOURS)

    job = ProcessingJob(
        user_id=user_id,
        tool_type=tool_type,
        input_filename=input_filename,
        output_filename=output_filename,
        status="completed",
        file_size=file_size,
        processing_time_ms=processing_time_ms,
        download_token=download_token,
        completed_at=datetime.utcnow(),
        expires_at=expires_at
    )
    db.add(job)

    usage = UsageRecord(
        user_id=user_id,
        tool_type=tool_type,
        file_size=file_size,
        processing_time=processing_time_sec
    )
    db.add(usage)

    # Update ToolStatus counters
    tool_res = await db.execute(select(ToolStatus).where(ToolStatus.tool_id == tool_type))
    t_status = tool_res.scalars().first()
    if not t_status:
        t_status = ToolStatus(
            tool_id=tool_type,
            enabled=True,
            category="pdf",
            usage_count=1,
            success_count=1,
            failed_count=0,
            total_processing_time_ms=processing_time_ms
        )
        db.add(t_status)
    else:
        t_status.usage_count = (t_status.usage_count or 0) + 1
        t_status.success_count = (t_status.success_count or 0) + 1
        t_status.total_processing_time_ms = (t_status.total_processing_time_ms or 0.0) + processing_time_ms

    await db.commit()
    await db.refresh(job)

    download_url = f"{settings.API_V1_STR}/download/{download_token}"
    return job, download_url
