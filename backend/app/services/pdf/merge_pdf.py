import os
from typing import Dict, Any, Optional, List
from pypdf import PdfWriter
from app.services.processor import DocumentProcessor, ProcessingError

class MergePdfProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("merge-pdf")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths or len(input_paths) < 2:
            raise ProcessingError("Please upload at least 2 PDF files to merge.", "INSUFFICIENT_FILES")

        output_path = self.prepare_output_file("pdf")
        merger = PdfWriter()

        try:
            for path in input_paths:
                if os.path.exists(path):
                    merger.append(path)
            
            merger.write(output_path)
            merger.close()

        except Exception as e:
            try:
                merger.close()
            except Exception:
                pass
            raise ProcessingError(f"Merge PDF failed: {str(e)}", "MERGE_FAILED")

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise ProcessingError("Failed to generate merged PDF file.", "EMPTY_OUTPUT")

        return {
            "output_path": output_path,
            "output_filename": "merged.pdf",
            "file_size": os.path.getsize(output_path),
            "merged_file_count": len(input_paths)
        }
