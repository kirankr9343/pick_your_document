import os
from typing import Dict, Any, Optional, List
from app.services.processor import DocumentProcessor, ProcessingError
from pdf2docx import Converter

class PdfToWordProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("pdf-to-word")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No input file provided", "INVALID_INPUT")

        pdf_path = input_paths[0]
        if not os.path.exists(pdf_path):
            raise ProcessingError("Input PDF file does not exist", "FILE_NOT_FOUND")

        output_path = self.prepare_output_file("docx")

        cv = None
        try:
            cv = Converter(pdf_path)
            cv.convert(output_path, start=0, end=None)
            cv.close()
        except Exception as e:
            if cv:
                try:
                    cv.close()
                except Exception:
                    pass
            raise ProcessingError(f"PDF to Word conversion failed: {str(e)}", "CONVERSION_ERROR")

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise ProcessingError("Failed to generate Word document output.", "EMPTY_OUTPUT")

        return {
            "output_path": output_path,
            "output_filename": "converted.docx",
            "file_size": os.path.getsize(output_path),
        }
