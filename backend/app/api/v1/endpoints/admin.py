import os
import json
import math
import time
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_, and_

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_admin, get_current_super_admin
from app.models.models import User, ProcessingJob, UsageRecord, ToolStatus, AdminAuditLog, Payment
from app.schemas.schemas import (
    UserResponse,
    JobResponse,
    RoleUpdateSchema,
    StatusUpdateSchema,
    ToolStatusResponse,
    ToolToggleSchema,
    AdminAuditLogResponse,
    PaginatedUsersResponse,
    PaginatedJobsResponse,
    PaginatedAuditLogsResponse,
    AdminDashboardMetrics,
    PaymentResponse,
    AdminPaymentReviewRequest
)
from app.services.payment_service import admin_review_payment


router = APIRouter()

ALL_TOOLS = [
    {"id": "pdf-to-word", "name": "PDF to Word Converter", "category": "pdf"},
    {"id": "word-to-pdf", "name": "Word to PDF Converter", "category": "documents"},
    {"id": "pdf-to-text", "name": "PDF to Text Extractor", "category": "pdf"},
    {"id": "image-to-text", "name": "Image to Text (OCR)", "category": "images"},
    {"id": "image-to-pdf", "name": "Image to PDF Converter", "category": "images"},
    {"id": "pdf-to-jpg", "name": "PDF to JPG Converter", "category": "pdf"},
    {"id": "merge-pdf", "name": "Merge PDF", "category": "pdf"},
    {"id": "split-pdf", "name": "Split PDF", "category": "pdf"},
    {"id": "compress-pdf", "name": "Compress PDF", "category": "pdf"},
    {"id": "pdf-summary", "name": "AI PDF Summary", "category": "ai"},
]

async def _log_admin_action(
    db: AsyncSession,
    admin: User,
    action: str,
    target_type: str,
    target_id: str,
    metadata: Optional[dict] = None
):
    """Creates an AdminAuditLog entry."""
    audit = AdminAuditLog(
        admin_user_id=admin.id,
        admin_email=admin.email,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata_json=json.dumps(metadata) if metadata else None
    )
    db.add(audit)
    await db.commit()

@router.get("/dashboard", response_model=AdminDashboardMetrics)
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    now = datetime.utcnow()
    start_of_today = datetime(now.year, now.month, now.day)

    # Users
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    new_users_today_res = await db.execute(select(func.count(User.id)).where(User.created_at >= start_of_today))
    new_users_today = new_users_today_res.scalar() or 0

    # Conversions / Jobs
    total_conversions_res = await db.execute(select(func.count(ProcessingJob.id)))
    total_conversions = total_conversions_res.scalar() or 0

    conversions_today_res = await db.execute(select(func.count(ProcessingJob.id)).where(ProcessingJob.created_at >= start_of_today))
    conversions_today = conversions_today_res.scalar() or 0

    successful_res = await db.execute(select(func.count(ProcessingJob.id)).where(ProcessingJob.status == "completed"))
    successful_conversions = successful_res.scalar() or 0

    failed_res = await db.execute(select(func.count(ProcessingJob.id)).where(ProcessingJob.status == "failed"))
    failed_conversions = failed_res.scalar() or 0

    active_res = await db.execute(select(func.count(ProcessingJob.id)).where(ProcessingJob.status.in_(["pending", "processing"])))
    active_jobs = active_res.scalar() or 0

    expired_res = await db.execute(select(func.count(ProcessingJob.id)).where(ProcessingJob.status == "expired"))
    expired_files_count = expired_res.scalar() or 0

    # Total bytes and avg time
    total_bytes_res = await db.execute(select(func.sum(ProcessingJob.file_size)))
    total_bytes = total_bytes_res.scalar() or 0
    total_file_size_mb = round(total_bytes / (1024 * 1024), 2)

    avg_time_res = await db.execute(select(func.avg(UsageRecord.processing_time)))
    avg_processing_time_sec = round(avg_time_res.scalar() or 0.0, 2)

    success_rate_percent = round((successful_conversions / total_conversions * 100), 1) if total_conversions > 0 else 100.0

    # Top tools
    top_tools_res = await db.execute(
        select(ProcessingJob.tool_type, func.count(ProcessingJob.id).label("count"))
        .group_by(ProcessingJob.tool_type)
        .order_by(desc("count"))
        .limit(5)
    )
    top_tools = [{"tool": row[0], "count": row[1]} for row in top_tools_res.all()]

    return AdminDashboardMetrics(
        total_users=total_users,
        new_users_today=new_users_today,
        total_conversions=total_conversions,
        conversions_today=conversions_today,
        successful_conversions=successful_conversions,
        failed_conversions=failed_conversions,
        success_rate_percent=success_rate_percent,
        total_file_size_mb=total_file_size_mb,
        average_processing_time_sec=avg_processing_time_sec,
        active_jobs=active_jobs,
        expired_files_count=expired_files_count,
        top_tools=top_tools
    )

@router.get("/users", response_model=PaginatedUsersResponse)
async def get_admin_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    q: Optional[str] = None,
    role: Optional[str] = None,
    user_status: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = select(User)

    if q:
        search = f"%{q.lower()}%"
        query = query.where(or_(func.lower(User.email).like(search), func.lower(User.name).like(search)))
    if role:
        query = query.where(User.role == role.upper())
    if user_status:
        query = query.where(User.status == user_status.lower())

    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(User.created_at)).offset((page - 1) * limit).limit(limit)
    users_res = await db.execute(query)
    users = users_res.scalars().all()

    user_responses = [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            role=u.role,
            status=u.status,
            is_admin=u.is_admin,
            last_login_at=u.last_login_at,
            created_at=u.created_at
        ) for u in users
    ]

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedUsersResponse(
        users=user_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    jobs_res = await db.execute(
        select(ProcessingJob)
        .where(ProcessingJob.user_id == user_id)
        .order_by(desc(ProcessingJob.created_at))
        .limit(20)
    )
    jobs = jobs_res.scalars().all()

    jobs_data = [
        {
            "id": j.id,
            "tool_type": j.tool_type,
            "input_filename": j.input_filename,
            "output_filename": j.output_filename,
            "status": j.status,
            "file_size": j.file_size,
            "processing_time_ms": j.processing_time_ms,
            "created_at": j.created_at
        } for j in jobs
    ]

    return {
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        ),
        "recent_jobs": jobs_data,
        "total_jobs_count": len(jobs)
    }

@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    payload: RoleUpdateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    target_role = payload.role.upper()
    if target_role not in ["USER", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be USER, ADMIN, or SUPER_ADMIN.")

    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Only SUPER_ADMIN can assign SUPER_ADMIN or demote another SUPER_ADMIN
    if (user.role == "SUPER_ADMIN" or target_role == "SUPER_ADMIN") and admin.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Only Super-Admins can manage SUPER_ADMIN roles.")

    old_role = user.role
    user.role = target_role
    user.is_admin = target_role in ["ADMIN", "SUPER_ADMIN"]
    await db.commit()
    await db.refresh(user)

    await _log_admin_action(
        db, admin, "ROLE_CHANGE", "user", user.id,
        {"email": user.email, "old_role": old_role, "new_role": target_role}
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        is_admin=user.is_admin,
        last_login_at=user.last_login_at,
        created_at=user.created_at
    )

@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    payload: StatusUpdateSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    target_status = payload.status.lower()
    if target_status not in ["active", "disabled"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be active or disabled.")

    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot disable your own admin account.")

    old_status = user.status
    user.status = target_status
    user.is_active = (target_status == "active")
    await db.commit()
    await db.refresh(user)

    await _log_admin_action(
        db, admin, "STATUS_CHANGE", "user", user.id,
        {"email": user.email, "old_status": old_status, "new_status": target_status}
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        status=user.status,
        is_admin=user.is_admin,
        last_login_at=user.last_login_at,
        created_at=user.created_at
    )

@router.get("/jobs", response_model=PaginatedJobsResponse)
async def get_admin_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    tool_type: Optional[str] = None,
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = select(ProcessingJob, User.email.label("user_email")).outerjoin(User, ProcessingJob.user_id == User.id)

    if status_filter:
        query = query.where(ProcessingJob.status == status_filter.lower())
    if tool_type:
        query = query.where(ProcessingJob.tool_type == tool_type)
    if q:
        search = f"%{q.lower()}%"
        query = query.where(or_(
            func.lower(ProcessingJob.id).like(search),
            func.lower(ProcessingJob.input_filename).like(search),
            func.lower(User.email).like(search)
        ))

    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(ProcessingJob.created_at)).offset((page - 1) * limit).limit(limit)
    res = await db.execute(query)
    rows = res.all()

    jobs_list = []
    for row in rows:
        job, email_val = row[0], row[1]
        download_url = f"{settings.API_V1_STR}/download/{job.download_token}" if job.download_token else None
        jobs_list.append(JobResponse(
            id=job.id,
            tool_type=job.tool_type,
            input_filename=job.input_filename,
            output_filename=job.output_filename,
            status=job.status,
            file_size=job.file_size,
            processing_time_ms=job.processing_time_ms,
            download_url=download_url,
            error_code=job.error_code,
            error_message=job.error_message,
            created_at=job.created_at,
            completed_at=job.completed_at,
            expires_at=job.expires_at,
            user_email=email_val
        ))

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedJobsResponse(
        jobs=jobs_list,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/errors")
async def get_admin_errors(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    res = await db.execute(
        select(ProcessingJob)
        .where(ProcessingJob.status == "failed")
        .order_by(desc(ProcessingJob.created_at))
        .limit(50)
    )
    failed_jobs = res.scalars().all()

    return [
        {
            "job_id": j.id,
            "tool_type": j.tool_type,
            "error_code": j.error_code or "PROCESSING_ERROR",
            "error_message": j.error_message or "An unexpected conversion error occurred.",
            "processing_time_ms": j.processing_time_ms,
            "created_at": j.created_at
        } for j in failed_jobs
    ]

@router.get("/tools", response_model=List[ToolStatusResponse])
async def get_admin_tools(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    db_statuses_res = await db.execute(select(ToolStatus))
    db_statuses = {t.tool_id: t for t in db_statuses_res.scalars().all()}

    output = []
    for tool in ALL_TOOLS:
        t_id = tool["id"]
        t_db = db_statuses.get(t_id)

        enabled = t_db.enabled if t_db else True
        usage_count = t_db.usage_count if t_db else 0
        success_count = t_db.success_count if t_db else 0
        failed_count = t_db.failed_count if t_db else 0
        total_time_ms = t_db.total_processing_time_ms if t_db else 0.0
        updated_at = t_db.updated_at if t_db else datetime.utcnow()

        avg_time = round(total_time_ms / usage_count, 1) if usage_count > 0 else 0.0

        output.append(ToolStatusResponse(
            tool_id=t_id,
            enabled=enabled,
            category=tool["category"],
            usage_count=usage_count,
            success_count=success_count,
            failed_count=failed_count,
            total_processing_time_ms=total_time_ms,
            avg_processing_time_ms=avg_time,
            updated_at=updated_at
        ))

    return output

@router.patch("/tools/{tool_id}", response_model=ToolStatusResponse)
async def toggle_tool_status(
    tool_id: str,
    payload: ToolToggleSchema,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    valid_ids = [t["id"] for t in ALL_TOOLS]
    if tool_id not in valid_ids:
        raise HTTPException(status_code=404, detail="Tool not found.")

    res = await db.execute(select(ToolStatus).where(ToolStatus.tool_id == tool_id))
    tool_status = res.scalars().first()

    category = next((t["category"] for t in ALL_TOOLS if t["id"] == tool_id), "pdf")

    if not tool_status:
        tool_status = ToolStatus(
            tool_id=tool_id,
            enabled=payload.enabled,
            category=category,
            usage_count=0,
            success_count=0,
            failed_count=0,
            total_processing_time_ms=0.0
        )
        db.add(tool_status)
    else:
        tool_status.enabled = payload.enabled

    await db.commit()
    await db.refresh(tool_status)

    await _log_admin_action(
        db, admin, "TOOL_TOGGLE", "tool", tool_id,
        {"enabled": payload.enabled}
    )

    avg_time = round(tool_status.total_processing_time_ms / tool_status.usage_count, 1) if tool_status.usage_count > 0 else 0.0

    return ToolStatusResponse(
        tool_id=tool_status.tool_id,
        enabled=tool_status.enabled,
        category=tool_status.category,
        usage_count=tool_status.usage_count,
        success_count=tool_status.success_count,
        failed_count=tool_status.failed_count,
        total_processing_time_ms=tool_status.total_processing_time_ms,
        avg_processing_time_ms=avg_time,
        updated_at=tool_status.updated_at
    )

@router.get("/analytics")
async def get_admin_analytics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    now = datetime.utcnow()
    last_30_days = now - timedelta(days=30)

    jobs_res = await db.execute(
        select(ProcessingJob.created_at, ProcessingJob.status, ProcessingJob.tool_type)
        .where(ProcessingJob.created_at >= last_30_days)
    )
    jobs = jobs_res.all()

    daily_counts = {}
    tool_counts = {}

    for job in jobs:
        created_at, status_val, tool_type = job[0], job[1], job[2]
        date_str = created_at.strftime("%Y-%m-%d")
        daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        tool_counts[tool_type] = tool_counts.get(tool_type, 0) + 1

    return {
        "daily_conversions": [{"date": k, "count": v} for k, v in sorted(daily_counts.items())],
        "tool_usage_distribution": [{"tool": k, "count": v} for k, v in sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)]
    }

@router.get("/system")
async def get_system_health(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Database test
    db_healthy = True
    try:
        await db.execute(select(func.count(User.id)))
    except Exception:
        db_healthy = False

    # Storage test
    temp_dir = settings.TEMP_STORAGE_DIR
    storage_healthy = os.path.exists(temp_dir)
    file_count = 0
    total_bytes = 0
    if storage_healthy:
        for f in os.listdir(temp_dir):
            fp = os.path.join(temp_dir, f)
            if os.path.isfile(fp):
                file_count += 1
                total_bytes += os.path.getsize(fp)

    return {
        "backend": {"status": "healthy", "uptime_env": settings.APP_ENV},
        "database": {"status": "healthy" if db_healthy else "unhealthy", "url": settings.DATABASE_URL.split("://")[0]},
        "storage": {
            "status": "healthy" if storage_healthy else "unhealthy",
            "path": temp_dir,
            "file_count": file_count,
            "total_mb": round(total_bytes / (1024 * 1024), 2)
        },
        "ocr_service": {"status": "healthy", "provider": settings.OCR_PROVIDER},
        "ai_service": {
            "status": "configured" if settings.AI_API_KEY else "heuristic_fallback",
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL
        }
    }

@router.get("/audit-logs", response_model=PaginatedAuditLogsResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    total_res = await db.execute(select(func.count(AdminAuditLog.id)))
    total = total_res.scalar() or 0

    res = await db.execute(
        select(AdminAuditLog)
        .order_by(desc(AdminAuditLog.created_at))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    logs = res.scalars().all()

    logs_list = [
        AdminAuditLogResponse(
            id=l.id,
            admin_user_id=l.admin_user_id,
            admin_email=l.admin_email,
            action=l.action,
            target_type=l.target_type,
            target_id=l.target_id,
            metadata_json=l.metadata_json,
            created_at=l.created_at
        ) for l in logs
    ]

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedAuditLogsResponse(
        logs=logs_list,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/payments", response_model=List[PaymentResponse])
async def get_admin_payments(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Returns payment records including pending UTR verification queue.
    Join with User to include user email.
    """
    query = select(Payment, User.email.label("user_email")).outerjoin(User, Payment.user_id == User.id)

    if status_filter:
        query = query.where(Payment.status == status_filter.upper())

    query = query.order_by(desc(Payment.created_at))
    res = await db.execute(query)
    rows = res.all()

    payment_responses = []
    for row in rows:
        p, email_val = row[0], row[1]
        payment_responses.append(PaymentResponse(
            id=p.id,
            user_id=p.user_id,
            user_email=email_val,
            order_id=p.order_id,
            gateway=p.gateway,
            gateway_payment_id=p.gateway_payment_id,
            utr=p.utr,
            amount=p.amount,
            currency=p.currency,
            plan=p.plan,
            status=p.status,
            verification_method=p.verification_method,
            created_at=p.created_at,
            verified_at=p.verified_at
        ))

    return payment_responses

@router.post("/payments/{payment_id}/review", response_model=PaymentResponse)
async def review_admin_payment(
    payment_id: str,
    payload: AdminPaymentReviewRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Admin approval or rejection of a pending UTR payment.
    Updates payment status, activates user subscription if approved, and writes to audit log.
    """
    try:
        payment = await admin_review_payment(
            db=db,
            admin=admin,
            payment_id=payment_id,
            action=payload.action
        )
        
        # Get user email
        user_res = await db.execute(select(User.email).where(User.id == payment.user_id))
        email_val = user_res.scalar()

        return PaymentResponse(
            id=payment.id,
            user_id=payment.user_id,
            user_email=email_val,
            order_id=payment.order_id,
            gateway=payment.gateway,
            gateway_payment_id=payment.gateway_payment_id,
            utr=payment.utr,
            amount=payment.amount,
            currency=payment.currency,
            plan=payment.plan,
            status=payment.status,
            verification_method=payment.verification_method,
            created_at=payment.created_at,
            verified_at=payment.verified_at
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

