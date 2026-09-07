import os
import time
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import save_uploaded_file, record_job_and_usage, get_current_user, check_tool_enabled
from app.models.models import User
from app.schemas.schemas import StandardResponse, OcrResultResponse
from app.services.processor import ProcessingError
from app.services.converters.pdf_to_word import PdfToWordProcessor
from app.services.converters.word_to_pdf import WordToPdfProcessor
from app.services.converters.pdf_to_text import PdfToTextProcessor
from app.services.converters.image_to_pdf import ImageToPdfProcessor
from app.services.converters.pdf_to_jpg import PdfToJpgProcessor
from app.services.ocr.ocr_processor import ImageOcrProcessor

router = APIRouter()

@router.post("/pdf-to-word", response_model=StandardResponse)
async def convert_pdf_to_word(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("pdf-to-word", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = PdfToWordProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "pdf-to-word", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message="PDF converted to Word successfully.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])

@router.post("/word-to-pdf", response_model=StandardResponse)
async def convert_word_to_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("word-to-pdf", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = WordToPdfProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "word-to-pdf", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message="Word converted to PDF successfully.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])

@router.post("/pdf-to-text", response_model=StandardResponse)
async def convert_pdf_to_text(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("pdf-to-text", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = PdfToTextProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "pdf-to-text", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message="Text extracted from PDF successfully.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])

@router.post("/image-to-text", response_model=OcrResultResponse)
async def convert_image_to_text(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("image-to-text", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = ImageOcrProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "image-to-text", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return OcrResultResponse(
            success=True,
            message="Image OCR text extracted successfully.",
            job_id=job.id,
            download_url=download_url,
            extracted_text=res["extracted_text"],
            word_count=res["word_count"]
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])

@router.post("/image-to-pdf", response_model=StandardResponse)
async def convert_image_to_pdf(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("image-to-pdf", db)
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

        processor = ImageToPdfProcessor()
        res = processor.process(saved_paths)
        
        job, download_url = await record_job_and_usage(
            db, "image-to-pdf", ", ".join(orig_names[:3]), res["output_filename"],
            res["output_path"], total_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message=f"Converted {len(saved_paths)} images to PDF successfully.",
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

@router.post("/pdf-to-jpg", response_model=StandardResponse)
async def convert_pdf_to_jpg(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    await check_tool_enabled("pdf-to-jpg", db)
    start_time = time.time()
    orig_name, temp_path, file_size = await save_uploaded_file(file)
    processor = PdfToJpgProcessor()

    try:
        res = processor.process([temp_path])
        job, download_url = await record_job_and_usage(
            db, "pdf-to-jpg", orig_name, res["output_filename"],
            res["output_path"], file_size, start_time, current_user.id if current_user else None
        )
        return StandardResponse(
            success=True,
            message=f"Converted PDF pages into JPEG format successfully.",
            job_id=job.id,
            download_url=download_url
        )
    except ProcessingError as e:
        raise HTTPException(status_code=400, detail={"error_code": e.error_code, "message": e.message})
    finally:
        processor.cleanup_files([temp_path])
