import os
import time
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import save_uploaded_file, record_job_and_usage, get_current_user
from app.models.models import User
from app.schemas.schemas import StandardResponse, CompressPdfResultResponse
from app.services.processor import ProcessingError
from app.services.pdf.merge_pdf import MergePdfProcessor
from app.services.pdf.split_pdf import SplitPdfProcessor
from app.services.pdf.compress_pdf import CompressPdfProcessor

router = APIRouter()

@router.post("/merge", response_model=StandardResponse)
async def merge_pdfs(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    start_time = time.time()
    saved_paths = []
    total_size = 0
    orig_names = []

    try:
        for file in files:
            orig_n, temp_p, f_size = await save_uploaded_file(file)
            saved_paths.append(temp_p)
            orig_names.append(orig_n)
            total_size += f_size

        processor = MergePdfProcessor()
        res = processor.process(saved_paths)
        
        job, download_url = await record_job_and_usage(
            db, "merge-pdf", ", ".join(orig_names[:3]), res["output_filename"],
            res["output_path"], total_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message=f"Successfully merged {len(saved_paths)} PDF documents.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        for p in saved_paths:
            if os.path.exists(p):
                try: os.remove(p)
                except Exception: pass

@router.post("/split", response_model=StandardResponse)
async def split_pdf(
    file: UploadFile = File(...),
    page_ranges: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = SplitPdfProcessor()

    try:
        options = {"page_ranges": page_ranges or ""}
        res = processor.process([temp_path], options=options)
        job, download_url = await record_job_and_usage(
            db, "split-pdf", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message="PDF split completed successfully.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])

@router.post("/compress", response_model=CompressPdfResultResponse)
async def compress_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = CompressPdfProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "compress-pdf", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return CompressPdfResultResponse(
            success=True,
            message="PDF compressed successfully.",
            job_id=job.id,
            download_url=download_url,
            original_size=res["original_size"],
            compressed_size=res["compressed_size"],
            saved_bytes=res["saved_bytes"],
            percentage_saved=res["percentage_saved"]
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])
