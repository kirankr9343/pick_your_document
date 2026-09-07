import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

def _authenticate_user(client, email, password, name="User"):
    """Helper to perform 2-Step Email + Password + OTP authentication in tests."""
    with patch("app.services.otp_service.generate_secure_otp", return_value="112233"):
        login_res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        if login_res.status_code != 200:
            reg_res = client.post("/api/v1/auth/register", json={"email": email, "password": password, "name": name})
            assert reg_res.status_code == 200, f"Reg failed: {reg_res.text}"
            purpose = "SIGNUP"
        else:
            purpose = "LOGIN"

        verify_res = client.post("/api/v1/auth/verify-otp", json={
            "destination": email,
            "otp": "112233",
            "purpose": purpose
        })
        assert verify_res.status_code == 200, f"Verify failed: {verify_res.text}"
        return verify_res.json()

def test_initial_admin_auto_promotion():
    email = "kirankr93439343@gmail.com"
    with TestClient(app) as client:
        data = _authenticate_user(client, email, "supersecretpass123", "Kiran Admin")
        assert data["user"]["role"] == "SUPER_ADMIN"
        assert data["user"]["is_admin"] is True

def test_non_admin_forbidden_access():
    email = f"normaluser_{os.urandom(4).hex()}@example.com"
    with TestClient(app) as client:
        data = _authenticate_user(client, email, "normalpassword123", "Normal User")
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt accessing admin endpoints
        dash_res = client.get("/api/v1/admin/dashboard", headers=headers)
        assert dash_res.status_code == 403

        users_res = client.get("/api/v1/admin/users", headers=headers)
        assert users_res.status_code == 403

        tools_res = client.get("/api/v1/admin/tools", headers=headers)
        assert tools_res.status_code == 403

def test_admin_dashboard_metrics_and_tool_toggle():
    admin_email = "kirankr93439343@gmail.com"
    with TestClient(app) as client:
        data = _authenticate_user(client, admin_email, "supersecretpass123", "Kiran Admin")
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test Dashboard metrics
        dash_res = client.get("/api/v1/admin/dashboard", headers=headers)
        assert dash_res.status_code == 200
        metrics = dash_res.json()
        assert "total_users" in metrics
        assert "total_conversions" in metrics
        assert "success_rate_percent" in metrics

        # Test Get Tools
        tools_res = client.get("/api/v1/admin/tools", headers=headers)
        assert tools_res.status_code == 200
        tools = tools_res.json()
        assert len(tools) >= 10

        # Test Toggle Tool
        pdf_tool = next(t for t in tools if t["tool_id"] == "pdf-to-word")
        toggle_res = client.patch(
            "/api/v1/admin/tools/pdf-to-word",
            headers=headers,
            json={"enabled": not pdf_tool["enabled"]}
        )
        assert toggle_res.status_code == 200
        assert toggle_res.json()["enabled"] == (not pdf_tool["enabled"])

        # Re-enable tool
        client.patch(
            "/api/v1/admin/tools/pdf-to-word",
            headers=headers,
            json={"enabled": True}
        )

def test_admin_audit_logs():
    admin_email = "kirankr93439343@gmail.com"
    with TestClient(app) as client:
        data = _authenticate_user(client, admin_email, "supersecretpass123", "Kiran Admin")
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        audit_res = client.get("/api/v1/admin/audit-logs", headers=headers)
        assert audit_res.status_code == 200
        data = audit_res.json()
        assert "logs" in data
        assert "total" in data
