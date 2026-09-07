# Architecture Specification - Pick Your Document

Pick Your Document is built using a modern service-oriented full-stack web architecture.

## System Design Diagram

```text
[ React / Next.js Frontend ]
            │ (REST JSON / FormData)
            ▼
[ FastAPI Backend Gateway ] ─── (Auth / Rate Limit Middleware)
            │
            ├──────► [ DocumentProcessor Service Registry ]
            │               ├── PdfToWordProcessor (pdf2docx)
            │               ├── WordToPdfProcessor (python-docx + reportlab / libreoffice)
            │               ├── PdfToTextProcessor (pypdf)
            │               ├── ImageOcrProcessor (Tesseract / EasyOCR)
            │               ├── ImageToPdfProcessor (Pillow)
            │               ├── PdfToJpgProcessor (PyMuPDF)
            │               ├── MergePdfProcessor (pypdf)
            │               ├── SplitPdfProcessor (pypdf)
            │               ├── CompressPdfProcessor (PyMuPDF stream & image compression)
            │               └── PdfSummaryProcessor (LLM API / Heuristic Analyzer)
            │
            ├──────► [ Async Storage Manager ] ──► (Isolated Temp Directory with Auto-Purge)
            │
            └──────► [ SQLAlchemy ORM ] ──► (PostgreSQL in Prod / SQLite in Dev)
```

## Core Design Patterns

1. **Service Processor Abstraction**:
   All conversion algorithms inherit from `DocumentProcessor`. Logic is isolated from API route handlers for testability and maintainability.

2. **Centralized Tool Configuration**:
   Tools are registered in `frontend/src/config/tools.config.ts`. Adding a new tool only requires implementing a processor service and adding a config entry.

3. **Dual Engine Converter Strategy**:
   Conversion processors utilize native Python packages locally and automatically leverage Linux container utilities (`soffice`, `tesseract`, `pdftoppm`) in production.
