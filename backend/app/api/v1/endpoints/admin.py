from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.models import User, ProcessingJob, UsageRecord
from app.schemas.schemas import AdminStatsResponse, JobResponse, UserResponse

router = APIRouter()

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    # Total Users
    res_users = await db.execute(select(func.count(User.id)))
    total_users = res_users.scalar() or 0

    # Total Jobs & Failed Jobs
    res_jobs = await db.execute(select(func.count(ProcessingJob.id)))
    total_conversions = res_jobs.scalar() or 0

    res_failed = await db.execute(
        select(func.count(ProcessingJob.id)).where(ProcessingJob.status == "failed")
    )
    failed_conversions = res_failed.scalar() or 0

    # Conversions Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    res_today = await db.execute(
        select(func.count(ProcessingJob.id)).where(ProcessingJob.created_at >= today_start)
    )
    conversions_today = res_today.scalar() or 0

    # Usage records statistics
    res_avg_time = await db.execute(select(func.avg(UsageRecord.processing_time)))
    avg_time = float(res_avg_time.scalar() or 0.0)

    res_size = await db.execute(select(func.sum(UsageRecord.file_size)))
    total_bytes = res_size.scalar() or 0
    total_mb = round(total_bytes / (1024 * 1024), 2)

    # Top tools query
    res_top = await db.execute(
        select(UsageRecord.tool_type, func.count(UsageRecord.id).label("count"))
        .group_by(UsageRecord.tool_type)
        .order_by(desc("count"))
        .limit(5)
    )
    top_tools = [{"tool_type": row[0], "count": row[1]} for row in res_top.all()]

    return AdminStatsResponse(
        total_users=total_users,
        total_conversions=total_conversions,
        conversions_today=conversions_today,
        failed_conversions=failed_conversions,
        average_processing_time=round(avg_time, 2),
        total_file_size_mb=total_mb,
        top_tools=top_tools,
        system_health={"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
    )

@router.get("/jobs", response_model=List[JobResponse])
async def list_admin_jobs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(ProcessingJob).order_by(desc(ProcessingJob.created_at)).limit(limit)
    )
    jobs = res.scalars().all()
    return [
        JobResponse(
            id=j.id,
            tool_type=j.tool_type,
            input_filename=j.input_filename,
            output_filename=j.output_filename,
            status=j.status,
            file_size=j.file_size,
            download_url=f"/api/v1/download/{j.download_token}" if j.download_token else None,
            error_code=j.error_code,
            error_message=j.error_message,
            created_at=j.created_at,
            completed_at=j.completed_at,
            expires_at=j.expires_at
        ) for j in jobs
    ]

@router.get("/users", response_model=List[UserResponse])
async def list_admin_users(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(User).order_by(desc(User.created_at)).limit(limit)
    )
    users = res.scalars().all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            is_admin=u.is_admin,
            created_at=u.created_at
        ) for u in users
    ]
