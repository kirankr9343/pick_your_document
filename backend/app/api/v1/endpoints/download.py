import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.models import ProcessingJob

router = APIRouter()

@router.get("/{download_token}")
async def download_file(
    download_token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ProcessingJob).where(ProcessingJob.download_token == download_token)
    )
    job = result.scalars().first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Download link invalid or expired."
        )

    if job.expires_at and datetime.utcnow() > job.expires_at:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Download link has expired."
        )

    # Search file in temp storage
    internal_filename = job.output_filename
    fpath = os.path.abspath(os.path.join(settings.TEMP_STORAGE_DIR, internal_filename))

    # Path traversal check
    temp_dir_abs = os.path.abspath(settings.TEMP_STORAGE_DIR)
    if not fpath.startswith(temp_dir_abs) or not os.path.exists(fpath):
        # Check if job created a random file name matching job
        found = False
        for f in os.listdir(settings.TEMP_STORAGE_DIR):
            if f.endswith(os.path.splitext(internal_filename)[1]):
                fpath = os.path.join(settings.TEMP_STORAGE_DIR, f)
                found = True
                break
        if not found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Output file was deleted or is no longer available."
            )

    return FileResponse(
        path=fpath,
        filename=job.output_filename or "download",
        media_type="application/octet-stream"
    )
