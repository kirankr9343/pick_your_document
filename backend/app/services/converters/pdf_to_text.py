import os
from typing import Dict, Any, Optional, List
from app.services.processor import DocumentProcessor, ProcessingError
from pypdf import PdfReader

class PdfToTextProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("pdf-to-text")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No input file provided", "INVALID_INPUT")

        pdf_path = input_paths[0]
        if not os.path.exists(pdf_path):
            raise ProcessingError("Input PDF file does not exist", "FILE_NOT_FOUND")

        output_path = self.prepare_output_file("txt")

        try:
            reader = PdfReader(pdf_path)
            if reader.is_encrypted:
                try:
                    reader.decrypt("")
                except Exception:
                    raise ProcessingError("PDF is password protected. Please unlock it before extracting text.", "ENCRYPTED_PDF")

            extracted_pages = []
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                extracted_pages.append(f"--- Page {idx + 1} ---\n\n{text.strip()}\n")

            full_text = "\n".join(extracted_pages)
            if not full_text.strip():
                full_text = "No extractable text found. If this is a scanned PDF, please try using our Image to Text (OCR) tool."

            with open(output_path, "w", encoding="utf-8") as f:
                f.write(full_text)

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"PDF to Text extraction failed: {str(e)}", "EXTRACTION_ERROR")

        return {
            "output_path": output_path,
            "output_filename": "extracted_text.txt",
            "file_size": os.path.getsize(output_path),
            "text": full_text,
            "page_count": len(reader.pages) if 'reader' in locals() else 0
        }
