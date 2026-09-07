import os
import re
import uuid
import time
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Tuple
from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.core.config import settings

ALGORITHM = "HS256"

ALLOWED_EXTENSIONS = {
    "pdf": ["application/pdf"],
    "doc": ["application/msword"],
    "docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "jpg": ["image/jpeg"],
    "jpeg": ["image/jpeg"],
    "png": ["image/png"],
    "webp": ["image/webp"],
    "txt": ["text/plain"],
    "xls": ["application/vnd.ms-excel"],
    "xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    "ppt": ["application/vnd.ms-powerpoint"],
    "pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pw_bytes = plain_password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pw_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def sanitize_filename(filename: str) -> str:
    """Removes path traversal characters and dangerous shell symbols."""
    filename = os.path.basename(filename)
    filename = re.sub(r"[^\w\.-]", "_", filename)
    filename = re.sub(r"\.\.+", ".", filename)
    if not filename:
        filename = f"upload_{uuid.uuid4().hex[:8]}"
    return filename

def validate_file_security(filename: str, file_size: int, content_type: Optional[str] = None) -> str:
    """Validates size, extension, and filename safety."""
    if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE_MB}MB.",
        )
    
    sanitized = sanitize_filename(filename)
    ext = sanitized.split(".")[-1].lower() if "." in sanitized else ""
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '.{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS.keys())}",
        )
    return sanitized

def generate_random_storage_path(extension: str) -> Tuple[str, str]:
    """Generates an obfuscated random filename and full internal path."""
    token = uuid.uuid4().hex
    internal_name = f"{token}.{extension.lstrip('.')}"
    full_path = os.path.abspath(os.path.join(settings.TEMP_STORAGE_DIR, internal_name))
    
    # Path traversal safety assertion
    temp_dir_abs = os.path.abspath(settings.TEMP_STORAGE_DIR)
    if not full_path.startswith(temp_dir_abs):
        raise HTTPException(status_code=400, detail="Invalid target path specified.")
        
    return internal_name, full_path

def cleanup_expired_files():
    """Removes temporary files older than settings.FILE_EXPIRY_HOURS."""
    now = time.time()
    cutoff = now - (settings.FILE_EXPIRY_HOURS * 3600)
    
    if not os.path.exists(settings.TEMP_STORAGE_DIR):
        return

    for fname in os.listdir(settings.TEMP_STORAGE_DIR):
        fpath = os.path.join(settings.TEMP_STORAGE_DIR, fname)
        if os.path.isfile(fpath):
            try:
                if os.path.getmtime(fpath) < cutoff:
                    os.remove(fpath)
            except Exception:
                pass
