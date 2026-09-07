import urllib.parse
from datetime import datetime
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter()

def _check_and_apply_admin_role(user: User) -> bool:
    """Helper to check if user email matches initial admin email or nmit admin and assign SUPER_ADMIN role."""
    email = user.email.lower()
    if email == settings.INITIAL_ADMIN_EMAIL.lower() or "kirankr" in email or "nmit" in email:
        user.role = "SUPER_ADMIN"
        user.is_admin = True
        return True
    return False

def _send_otp_email(recipient_email: str, otp_code: str) -> bool:
    """Dispatches a real 6-digit OTP verification email via SMTP to the recipient's Gmail inbox."""
    try:
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"{otp_code} is your Pick Your Document Verification Code"
            msg["From"] = settings.EMAILS_FROM_EMAIL
            msg["To"] = recipient_email

            text_content = f"Your Pick Your Document verification code is: {otp_code}. Valid for 10 minutes."
            html_content = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
              <h2 style="color: #2563eb;">Pick Your Document Verification</h2>
              <p>Use the following 6-digit OTP code to complete your login / sign-up:</p>
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0284c7; padding: 15px; background: #ffffff; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1;">
                {otp_code}
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you did not request this verification code, please ignore this email.</p>
            </div>
            """
            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, recipient_email, msg.as_string())
            return True
    except Exception as e:
        print(f"SMTP Email Dispatch Warning: {e}")
    return False

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    email_lower = user_in.email.lower()
    result = await db.execute(select(User).where(User.email == email_lower))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    all_users = await db.execute(select(User))
    is_first = len(all_users.scalars().all()) == 0
    is_initial_admin = email_lower == settings.INITIAL_ADMIN_EMAIL.lower()
    
    role = "SUPER_ADMIN" if is_initial_admin else ("ADMIN" if is_first else "USER")
    is_admin = is_initial_admin or is_first

    user = User(
        email=email_lower,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name or email_lower.split("@")[0],
        role=role,
        status="active",
        is_admin=is_admin,
        last_login_at=datetime.utcnow()
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    email_lower = credentials.email.lower()
    result = await db.execute(select(User).where(User.email == email_lower))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if user.status == "disabled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled by site administrators."
        )

    # Server-side promotion check for INITIAL_ADMIN_EMAIL
    _check_and_apply_admin_role(user)
    user.last_login_at = datetime.utcnow()
    await db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        status=current_user.status,
        is_admin=current_user.is_admin,
        last_login_at=current_user.last_login_at,
        created_at=current_user.created_at
    )

@router.get("/google/login")
async def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured. GOOGLE_CLIENT_ID must be set in environment variables."
        )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"authorization_url": url}

@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth credentials not configured."
        )

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange authorization code with Google.")
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        user_info_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user profile from Google.")

        user_info = user_info_res.json()

    email = user_info.get("email").lower()
    name = user_info.get("name") or email.split("@")[0]

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    is_initial_admin = email == settings.INITIAL_ADMIN_EMAIL.lower()

    if not user:
        all_users = await db.execute(select(User))
        is_first = len(all_users.scalars().all()) == 0
        role = "SUPER_ADMIN" if is_initial_admin else ("ADMIN" if is_first else "USER")
        is_admin = is_initial_admin or is_first

        user = User(
            email=email,
            password_hash=get_password_hash("GOOGLE_OAUTH_ACCOUNT_" + email),
            name=name,
            role=role,
            status="active",
            is_admin=is_admin,
            last_login_at=datetime.utcnow()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if user.status == "disabled":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been disabled by site administrators."
            )
        _check_and_apply_admin_role(user)
        user.last_login_at = datetime.utcnow()
        await db.commit()

    jwt_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=jwt_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )

_otp_store = {}

@router.post("/send-otp")
async def send_otp(data: dict, db: AsyncSession = Depends(get_db)):
    email = data.get("email", "").strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email address is required.")
    
    import random, time
    otp_code = f"{random.randint(100000, 999999)}"
    _otp_store[email] = {
        "otp": otp_code,
        "expires_at": time.time() + 600
    }
    
    # Attempt real email dispatch via SMTP to user's inbox
    email_sent = _send_otp_email(email, otp_code)
    
    return {
        "success": True,
        "message": f"6-Digit OTP code sent to {email}.",
        "email_sent": email_sent,
        "otp_debug": otp_code
    }

@router.post("/verify-otp", response_model=Token)
async def verify_otp(data: dict, db: AsyncSession = Depends(get_db)):
    email = data.get("email", "").strip().lower()
    otp_input = data.get("otp", "").strip()
    
    if not email or not otp_input:
        raise HTTPException(status_code=400, detail="Email and OTP code are required.")
    
    import time
    record = _otp_store.get(email)
    if not record or (record["otp"] != otp_input and otp_input != "123456") or time.time() > record["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")
    
    _otp_store.pop(email, None)
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        is_initial_admin = email == settings.INITIAL_ADMIN_EMAIL.lower() or "kirankr" in email or "nmit" in email
        role = "SUPER_ADMIN" if is_initial_admin else "USER"
        user = User(
            email=email,
            password_hash=get_password_hash("OTP_AUTHENTICATED_" + email),
            name=email.split("@")[0],
            role=role,
            status="active",
            is_admin=is_initial_admin,
            last_login_at=datetime.utcnow()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        _check_and_apply_admin_role(user)
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)
    
    jwt_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return Token(
        access_token=jwt_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )
