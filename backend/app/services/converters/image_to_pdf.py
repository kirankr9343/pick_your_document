import os
from typing import Dict, Any, Optional, List
from PIL import Image
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from app.services.processor import DocumentProcessor, ProcessingError

class ImageToPdfProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("image-to-pdf")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No image files provided", "INVALID_INPUT")

        output_path = self.prepare_output_file("pdf")

        try:
            # Load and convert all images to RGB
            images = []
            for path in input_paths:
                if not os.path.exists(path):
                    continue
                img = Image.open(path)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                images.append(img)

            if not images:
                raise ProcessingError("No valid readable image files were found.", "INVALID_IMAGES")

            # Save first image and append remaining images as PDF pages
            first_img = images[0]
            remaining_imgs = images[1:] if len(images) > 1 else []
            
            first_img.save(output_path, "PDF", resolution=100.0, save_all=True, append_images=remaining_imgs)

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"Image to PDF conversion failed: {str(e)}", "CONVERSION_ERROR")

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            raise ProcessingError("Generated PDF file is empty.", "EMPTY_OUTPUT")

        return {
            "output_path": output_path,
            "output_filename": "converted_images.pdf",
            "file_size": os.path.getsize(output_path),
            "image_count": len(images)
        }
