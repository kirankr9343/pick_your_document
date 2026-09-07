import os
import fitz  # PyMuPDF
from typing import Dict, Any, Optional, List
from app.services.processor import DocumentProcessor, ProcessingError

class CompressPdfProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("compress-pdf")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No PDF file provided", "INVALID_INPUT")

        pdf_path = input_paths[0]
        if not os.path.exists(pdf_path):
            raise ProcessingError("Input PDF file does not exist", "FILE_NOT_FOUND")

        original_size = os.path.getsize(pdf_path)
        output_path = self.prepare_output_file("pdf")

        try:
            doc = fitz.open(pdf_path)
            if doc.is_encrypted:
                raise ProcessingError("PDF is password protected.", "ENCRYPTED_PDF")

            # Compress PDF stream content and downscale raster images where appropriate
            doc.save(
                output_path,
                garbage=4,
                deflate=True,
                deflate_images=True,
                deflate_fonts=True,
                clean=True
            )
            doc.close()

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"Compress PDF failed: {str(e)}", "COMPRESS_FAILED")

        compressed_size = os.path.getsize(output_path)
        
        # If output wasn't smaller, copy original
        if compressed_size >= original_size:
            with open(pdf_path, 'rb') as f_in, open(output_path, 'wb') as f_out:
                f_out.write(f_in.read())
            compressed_size = original_size

        saved_bytes = max(0, original_size - compressed_size)
        percentage_saved = round((saved_bytes / original_size) * 100, 1) if original_size > 0 else 0.0

        return {
            "output_path": output_path,
            "output_filename": "compressed.pdf",
            "file_size": compressed_size,
            "original_size": original_size,
            "compressed_size": compressed_size,
            "saved_bytes": saved_bytes,
            "percentage_saved": percentage_saved
        }
