import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

TEST_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "test-data"))

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data

def test_pdf_to_text_api(client):
    pdf_path = os.path.join(TEST_DATA_DIR, "sample.pdf")
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/convert/pdf-to-text",
                files={"file": ("sample.pdf", f, "application/pdf")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "download_url" in data

def test_image_ocr_api(client):
    img_path = os.path.join(TEST_DATA_DIR, "sample.png")
    if os.path.exists(img_path):
        with open(img_path, "rb") as f:
            response = client.post(
                "/api/v1/convert/image-to-text",
                files={"file": ("sample.png", f, "image/png")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

def test_pdf_summary_api(client):
    pdf_path = os.path.join(TEST_DATA_DIR, "sample.pdf")
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/ai/pdf-summary",
                files={"file": ("sample.pdf", f, "application/pdf")}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

def test_auth_register_and_login_with_otp(client):
    email = f"testuser_{os.urandom(4).hex()}@example.com"
    payload = {"email": email, "password": "securepassword123", "name": "Test User"}
    
    with patch("app.services.otp_service.generate_secure_otp", return_value="654321"):
        # Step 1: Register credentials
        reg_res = client.post("/api/v1/auth/register", json=payload)
        assert reg_res.status_code == 200
        reg_data = reg_res.json()
        assert reg_data["otp_required"] is True

        # Step 2: Verify Registration OTP
        verify_reg = client.post("/api/v1/auth/verify-otp", json={
            "destination": email,
            "otp": "654321",
            "purpose": "SIGNUP"
        })
        assert verify_reg.status_code == 200
        token_data = verify_reg.json()
        assert "access_token" in token_data
        assert token_data["user"]["email"] == email

        # Step 3: Login credentials
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": "securepassword123"})
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["otp_required"] is True

        # Step 4: Verify Login OTP
        verify_login = client.post("/api/v1/auth/verify-otp", json={
            "destination": email,
            "otp": "654321",
            "purpose": "LOGIN"
        })
        assert verify_login.status_code == 200
        assert "access_token" in verify_login.json()
