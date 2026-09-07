import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import save_uploaded_file, record_job_and_usage, get_current_user, check_tool_enabled
from app.models.models import User
from app.schemas.schemas import AiSummaryResultResponse, AiSummaryOutput
from app.services.processor import ProcessingError
from app.services.ai.ai_summary import PdfSummaryProcessor

router = APIRouter()

@router.post("/pdf-summary", response_model=AiSummaryResultResponse)
async def summarize_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("pdf-summary", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = PdfSummaryProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "pdf-summary", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return AiSummaryResultResponse(
            success=True,
            message="AI Document Summary generated successfully.",
            job_id=job.id,
            download_url=download_url,
            summary_data=AiSummaryOutput(**res["summary_data"])
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])
