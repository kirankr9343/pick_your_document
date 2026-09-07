import os
import zipfile
import fitz  # PyMuPDF
from typing import Dict, Any, Optional, List
from app.services.processor import DocumentProcessor, ProcessingError

class PdfToJpgProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("pdf-to-jpg")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No PDF file provided", "INVALID_INPUT")

        pdf_path = input_paths[0]
        if not os.path.exists(pdf_path):
            raise ProcessingError("Input PDF file does not exist", "FILE_NOT_FOUND")

        try:
            doc = fitz.open(pdf_path)
            if doc.is_encrypted:
                raise ProcessingError("PDF is password protected.", "ENCRYPTED_PDF")

            page_count = len(doc)
            if page_count == 0:
                raise ProcessingError("PDF contains 0 pages.", "EMPTY_PDF")

            generated_files = []

            for page_num in range(page_count):
                page = doc.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                img_path = self.prepare_output_file("jpg")
                pix.save(img_path)
                generated_files.append((page_num + 1, img_path))

            doc.close()

            if len(generated_files) == 1:
                final_path = generated_files[0][1]
                output_filename = "page_1.jpg"
            else:
                final_path = self.prepare_output_file("zip")
                output_filename = "pdf_pages_jpg.zip"
                with zipfile.ZipFile(final_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                    for page_no, img_p in generated_files:
                        zipf.write(img_p, arcname=f"page_{page_no}.jpg")
                        try:
                            os.remove(img_p)
                        except Exception:
                            pass

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"PDF to JPG conversion failed: {str(e)}", "CONVERSION_ERROR")

        return {
            "output_path": final_path,
            "output_filename": output_filename,
            "file_size": os.path.getsize(final_path),
            "page_count": page_count
        }
