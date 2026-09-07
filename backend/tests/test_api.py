import os
import asyncio
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import init_db

TEST_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test-data"))

@pytest.fixture(autouse=True)
def setup_db():
    asyncio.run(init_db())

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data

def test_pdf_to_text_api():
    pdf_path = os.path.join(TEST_DATA_DIR, "sample.pdf")
    with TestClient(app) as client:
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/convert/pdf-to-text",
                files={"file": ("sample.pdf", f, "application/pdf")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data

def test_image_ocr_api():
    img_path = os.path.join(TEST_DATA_DIR, "sample.png")
    with TestClient(app) as client:
        with open(img_path, "rb") as f:
            response = client.post(
                "/api/v1/convert/image-to-text",
                files={"file": ("sample.png", f, "image/png")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "extracted_text" in data

def test_pdf_summary_api():
    pdf_path = os.path.join(TEST_DATA_DIR, "sample.pdf")
    with TestClient(app) as client:
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/ai/pdf-summary",
                files={"file": ("sample.pdf", f, "application/pdf")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "summary_data" in data
        assert "summary" in data["summary_data"]

def test_auth_register_and_login():
    email = f"testuser_{os.urandom(4).hex()}@example.com"
    payload = {"email": email, "password": "securepassword123", "name": "Test User"}
    with TestClient(app) as client:
        reg_res = client.post("/api/v1/auth/register", json=payload)
        assert reg_res.status_code == 200
        data = reg_res.json()
        assert "access_token" in data

        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "securepassword123"})
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()
