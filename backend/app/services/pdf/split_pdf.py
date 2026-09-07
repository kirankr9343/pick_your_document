import os
import re
import zipfile
from typing import Dict, Any, Optional, List, Set
from pypdf import PdfReader, PdfWriter
from app.services.processor import DocumentProcessor, ProcessingError

class SplitPdfProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("split-pdf")

    def _parse_page_ranges(self, page_str: str, total_pages: int) -> List[List[int]]:
        """
        Parses page strings like '1-3, 5, 8-10' into list of 0-indexed page number groups.
        """
        if not page_str or not page_str.strip():
            # Default split: every single page separately
            return [[i] for i in range(total_pages)]

        groups = []
        parts = [p.strip() for p in page_str.split(",") if p.strip()]

        for part in parts:
            if "-" in part:
                match = re.match(r"^(\d+)\s*-\s*(\d+)$", part)
                if match:
                    start, end = int(match.group(1)), int(match.group(2))
                    start = max(1, min(start, total_pages))
                    end = max(1, min(end, total_pages))
                    if start <= end:
                        groups.append(list(range(start - 1, end)))
            elif part.isdigit():
                val = int(part)
                if 1 <= val <= total_pages:
                    groups.append([val - 1])

        if not groups:
            raise ProcessingError("Invalid page range specified.", "INVALID_PAGE_RANGE")

        return groups

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not input_paths:
            raise ProcessingError("No input file provided", "INVALID_INPUT")

        pdf_path = input_paths[0]
        if not os.path.exists(pdf_path):
            raise ProcessingError("Input PDF file does not exist", "FILE_NOT_FOUND")

        page_str = options.get("page_ranges", "") if options else ""

        try:
            reader = PdfReader(pdf_path)
            total_pages = len(reader.pages)
            if total_pages == 0:
                raise ProcessingError("PDF has no pages.", "EMPTY_PDF")

            groups = self._parse_page_ranges(page_str, total_pages)
            split_files = []

            for idx, page_group in enumerate(groups):
                writer = PdfWriter()
                for page_num in page_group:
                    writer.add_page(reader.pages[page_num])
                
                temp_split_path = self.prepare_output_file("pdf")
                with open(temp_split_path, "wb") as f_out:
                    writer.write(f_out)
                
                range_label = f"pages_{page_group[0]+1}-{page_group[-1]+1}" if len(page_group) > 1 else f"page_{page_group[0]+1}"
                split_files.append((range_label, temp_split_path))

            if len(split_files) == 1:
                final_output_path = split_files[0][1]
                output_filename = f"split_{split_files[0][0]}.pdf"
            else:
                final_output_path = self.prepare_output_file("zip")
                output_filename = "split_pages.zip"
                with zipfile.ZipFile(final_output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                    for label, fpath in split_files:
                        zipf.write(fpath, arcname=f"{label}.pdf")
                        try:
                            os.remove(fpath)
                        except Exception:
                            pass

        except ProcessingError:
            raise
        except Exception as e:
            raise ProcessingError(f"Split PDF failed: {str(e)}", "SPLIT_FAILED")

        return {
            "output_path": final_output_path,
            "output_filename": output_filename,
            "file_size": os.path.getsize(final_output_path),
            "split_count": len(split_files)
        }
