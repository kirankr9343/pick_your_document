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
from app.models.models import User, ProcessingJob, UsageRecord

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_current_admin(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this action."
        )
    return current_user

async def save_uploaded_file(file: UploadFile) -> Tuple[str, str, int]:
    """
    Saves an uploaded file safely after validating file size & extension.
    Returns (sanitized_original_filename, internal_temp_filepath, file_size_bytes).
    """
    # Read file content into memory or temporary stream
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
    processing_time = time.time() - start_time
    expires_at = datetime.utcnow() + timedelta(hours=settings.FILE_EXPIRY_HOURS)

    job = ProcessingJob(
        user_id=user_id,
        tool_type=tool_type,
        input_filename=input_filename,
        output_filename=output_filename,
        status="completed",
        file_size=file_size,
        download_token=download_token,
        completed_at=datetime.utcnow(),
        expires_at=expires_at
    )
    db.add(job)

    usage = UsageRecord(
        user_id=user_id,
        tool_type=tool_type,
        file_size=file_size,
        processing_time=processing_time
    )
    db.add(usage)

    await db.commit()
    await db.refresh(job)

    download_url = f"{settings.API_V1_STR}/download/{download_token}"
    return job, download_url
