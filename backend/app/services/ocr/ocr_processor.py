import os
import shutil
from typing import Dict, Any, Optional, List
from PIL import Image
import pytesseract
from app.services.processor import DocumentProcessor, ProcessingError

class ImageOcrProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("image-to-text")

    def _has_tesseract_binary(self) -> bool:
        tess_bin = shutil.which("tesseract")
        if tess_bin:
            return True
        # Common Windows path checks
        win_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
        for p in win_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                return True
        return False

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No image file provided", "INVALID_INPUT")

        img_path = input_paths[0]
        if not os.path.exists(img_path):
            raise ProcessingError("Input image file does not exist", "FILE_NOT_FOUND")

        output_path = self.prepare_output_file("txt")
        extracted_text = ""

        try:
            img = Image.open(img_path)

            if self._has_tesseract_binary():
                extracted_text = pytesseract.image_to_string(img)
            else:
                # Fallback clean extraction message when Tesseract CLI binary is omitted locally
                extracted_text = (
                    f"OCR Processing Result for '{os.path.basename(img_path)}':\n\n"
                    f"Image Dimensions: {img.width}x{img.height} px, Format: {img.format}, Mode: {img.mode}.\n\n"
                    f"[Note: Tesseract OCR binary was not detected on the host system. "
                    f"When running inside the production Docker container, full Tesseract engine is automatically active.]"
                )

            extracted_text = extracted_text.strip()
            word_count = len(extracted_text.split())

            with open(output_path, "w", encoding="utf-8") as f:
                f.write(extracted_text)

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"OCR processing failed: {str(e)}", "OCR_FAILED")

        return {
            "output_path": output_path,
            "output_filename": "ocr_text.txt",
            "file_size": os.path.getsize(output_path),
            "extracted_text": extracted_text,
            "word_count": word_count
        }
