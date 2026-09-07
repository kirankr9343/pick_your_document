import os
import pytest
from app.services.converters.pdf_to_word import PdfToWordProcessor
from app.services.converters.word_to_pdf import WordToPdfProcessor
from app.services.converters.pdf_to_text import PdfToTextProcessor
from app.services.converters.image_to_pdf import ImageToPdfProcessor
from app.services.converters.pdf_to_jpg import PdfToJpgProcessor
from app.services.pdf.merge_pdf import MergePdfProcessor
from app.services.pdf.split_pdf import SplitPdfProcessor
from app.services.pdf.compress_pdf import CompressPdfProcessor
from app.services.ocr.ocr_processor import ImageOcrProcessor
from app.services.ai.ai_summary import PdfSummaryProcessor

TEST_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test-data"))

@pytest.fixture
def pdf_sample():
    return os.path.join(TEST_DATA_DIR, "sample.pdf")

@pytest.fixture
def docx_sample():
    return os.path.join(TEST_DATA_DIR, "sample.docx")

@pytest.fixture
def image_sample():
    return os.path.join(TEST_DATA_DIR, "sample.png")

@pytest.fixture
def multi_pdf_sample():
    return os.path.join(TEST_DATA_DIR, "sample-multi-page.pdf")

def test_pdf_to_word(pdf_sample):
    processor = PdfToWordProcessor()
    res = processor.process([pdf_sample])
    assert os.path.exists(res["output_path"])
    assert res["file_size"] > 0
    assert res["output_filename"].endswith(".docx")
    processor.cleanup_files([res["output_path"]])

def test_word_to_pdf(docx_sample):
    processor = WordToPdfProcessor()
    res = processor.process([docx_sample])
    assert os.path.exists(res["output_path"])
    assert res["file_size"] > 0
    assert res["output_filename"].endswith(".pdf")
    processor.cleanup_files([res["output_path"]])

def test_pdf_to_text(pdf_sample):
    processor = PdfToTextProcessor()
    res = processor.process([pdf_sample])
    assert os.path.exists(res["output_path"])
    assert "Sample Single Page PDF" in res["text"] or res["file_size"] > 0
    processor.cleanup_files([res["output_path"]])

def test_image_ocr(image_sample):
    processor = ImageOcrProcessor()
    res = processor.process([image_sample])
    assert os.path.exists(res["output_path"])
    assert "extracted_text" in res
    processor.cleanup_files([res["output_path"]])

def test_image_to_pdf(image_sample):
    processor = ImageToPdfProcessor()
    res = processor.process([image_sample])
    assert os.path.exists(res["output_path"])
    assert res["output_filename"].endswith(".pdf")
    processor.cleanup_files([res["output_path"]])

def test_pdf_to_jpg(multi_pdf_sample):
    processor = PdfToJpgProcessor()
    res = processor.process([multi_pdf_sample])
    assert os.path.exists(res["output_path"])
    assert res["page_count"] == 2
    processor.cleanup_files([res["output_path"]])

def test_merge_pdf(pdf_sample, multi_pdf_sample):
    processor = MergePdfProcessor()
    res = processor.process([pdf_sample, multi_pdf_sample])
    assert os.path.exists(res["output_path"])
    assert res["output_filename"].endswith(".pdf")
    processor.cleanup_files([res["output_path"]])

def test_split_pdf(multi_pdf_sample):
    processor = SplitPdfProcessor()
    res = processor.process([multi_pdf_sample], options={"page_ranges": "1-2"})
    assert os.path.exists(res["output_path"])
    processor.cleanup_files([res["output_path"]])

def test_compress_pdf(pdf_sample):
    processor = CompressPdfProcessor()
    res = processor.process([pdf_sample])
    assert os.path.exists(res["output_path"])
    assert "compressed_size" in res
    assert "percentage_saved" in res
    processor.cleanup_files([res["output_path"]])

def test_pdf_summary(pdf_sample):
    processor = PdfSummaryProcessor()
    res = processor.process([pdf_sample])
    assert os.path.exists(res["output_path"])
    summary_data = res["summary_data"]
    assert "summary" in summary_data
    assert "key_points" in summary_data
    assert "important_terms" in summary_data
    assert "action_items" in summary_data
    assert "questions_to_review" in summary_data
    processor.cleanup_files([res["output_path"]])
