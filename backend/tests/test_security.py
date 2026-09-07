import pytest
from fastapi import HTTPException
from app.core.security import sanitize_filename, validate_file_security, generate_random_storage_path

def test_sanitize_filename_path_traversal():
    bad_name = "../../etc/passwd"
    sanitized = sanitize_filename(bad_name)
    assert ".." not in sanitized
    assert "/" not in sanitized
    assert "\\" not in sanitized
    assert sanitized == "passwd"

def test_sanitize_filename_special_chars():
    bad_name = "my document ($file) & script<>.pdf"
    sanitized = sanitize_filename(bad_name)
    assert "<" not in sanitized
    assert ">" not in sanitized
    assert "$" not in sanitized
    assert sanitized.endswith(".pdf")

def test_validate_file_security_unsupported_extension():
    with pytest.raises(HTTPException) as exc_info:
        validate_file_security("malicious_script.exe", 1024)
    assert exc_info.value.status_code == 400
    assert "Unsupported file extension" in exc_info.value.detail

def test_validate_file_security_oversized_file():
    with pytest.raises(HTTPException) as exc_info:
        validate_file_security("large_doc.pdf", 100 * 1024 * 1024) # 100MB
    assert exc_info.value.status_code == 413
    assert "exceeds maximum limit" in exc_info.value.detail

def test_generate_random_storage_path():
    internal_name, full_path = generate_random_storage_path("pdf")
    assert internal_name.endswith(".pdf")
    assert "temp" in full_path
