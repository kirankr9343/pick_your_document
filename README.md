# PICK YOUR DOCUMENT

Tagline: **Convert. Extract. Create. Simplify.**

An all-in-one document conversion, extraction, PDF manipulation, and AI document understanding web application.

---

## Features

### MVP Tool Suite (100% Functional)

1. **PDF → Word**: Converts PDF files to editable `.docx` documents preserving layout, tables, and formatting structure (`pdf2docx`).
2. **Word → PDF**: Converts `.docx` files to `.pdf` format via dual-engine parsing (`python-docx` + `reportlab` native engine / `libreoffice` container engine).
3. **PDF → Text**: Extracts structured text page by page from PDF documents (`pypdf`).
4. **Image → Text (OCR)**: Optical Character Recognition on JPG, PNG, and WebP images with interactive text editor, copy-to-clipboard, and TXT export options.
5. **JPG/PNG → PDF**: Converts single or multiple images into a consolidated PDF file with page ordering controls (`Pillow`).
6. **PDF → JPG**: Renders PDF pages into JPEG graphics packaged as single images or `.zip` archives (`PyMuPDF`).
7. **Merge PDF**: Combines multiple PDF files into a single document with drag-and-drop file reordering.
8. **Split PDF**: Splits PDF documents by page range (e.g. `1-3, 5, 8-10`) or extracts all pages into individual PDFs in a `.zip` archive.
9. **Compress PDF**: Optimizes PDF fonts, streams, and raster images with before/after file size display and percentage reduction metrics.
10. **AI PDF Summary**: Extracts text and generates structured AI summaries featuring Executive Summary, Key Points, Important Terms, Action Items, and Questions to Review.

---

## Tech Stack

- **Frontend**: Next.js / Vite + React 18, TypeScript, Lucide Icons, Custom Design System CSS (Inter/Outfit typography, glassmorphism, responsive mobile-first views).
- **Backend**: Python 3.10+ FastAPI, Uvicorn, Pydantic v2, PyMuPDF, pdf2docx, python-docx, reportlab, pypdf, Pillow, pytesseract.
- **Database**: PostgreSQL (Production) / SQLite with AsyncIO (`aiosqlite`) for zero-config local development, SQLAlchemy 2.0 ORM, Alembic migrations.
- **Security & Storage**: Path traversal sanitization, random UUID tokenized storage, background worker auto-file purge task (files automatically deleted after processing and within 2 hours max).
- **Testing**: Pytest automated unit test suite (20 tests covering converters, security, API routes) and synthetic test file generator.
- **DevOps**: Docker Compose stack (`Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml`).

---

## Local Development Quickstart

### Prerequisites
- Python 3.10+
- Node.js 20+

### 1. Clone & Set Up Backend

```bash
cd backend
pip install -r requirements.txt
```

Generate synthetic test files:
```bash
python scripts/generate_test_data.py
```

Run Backend Pytest Suite:
```bash
pytest backend/tests
```

Start Backend Dev Server:
```bash
uvicorn app.main:app --reload --port 8000
```
Backend API docs will be available at `http://127.0.0.1:8000/docs`.

### 2. Set Up Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend web app will be running at `http://localhost:3000`.

---

## Running with Docker Compose

To launch the complete production stack (Backend + Frontend + PostgreSQL + Redis):

```bash
docker compose up -d
```

---

## Centralized Tool Registry Architecture

Adding a new tool takes only 3 steps:
1. Create a processor service class inheriting from `DocumentProcessor`.
2. Register an API router endpoint in `backend/app/api/v1/endpoints/converters.py`.
3. Add the tool configuration in `frontend/src/config/tools.config.ts`.

The frontend catalog, search filter, and dynamic tool runner will automatically generate the UI, dropzone, and SEO content!

---

## License

MIT License. Pick Your Document.
