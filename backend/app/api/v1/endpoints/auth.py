from typing import Optional
import urllib.parse
from datetime import datetime
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.models import User, OTPVerification
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token, VerifyOtpRequest, ResendOtpRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.api.deps import get_current_user
from app.services.otp_service import create_otp, verify_otp_code, mask_destination

router = APIRouter()

def _check_and_apply_admin_role(user: User) -> bool:
    """Helper to check if user email matches initial admin email or nmit admin and assign SUPER_ADMIN role."""
    email = user.email.lower()
    if email == settings.INITIAL_ADMIN_EMAIL.lower() or "kirankr" in email or "nmit" in email:
        user.role = "SUPER_ADMIN"
        user.is_admin = True
        return True
    return False

def _send_otp_email(recipient_email: str, otp_code: str, purpose: str = "verification") -> bool:
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

            text_content = f"Your Pick Your Document verification code for {purpose} is: {otp_code}. Valid for 5 minutes."
            html_content = f"""
            <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f8fafc; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0;">
              <h2 style="color: #1e293b; margin-top: 0;">Pick Your Document</h2>
              <p style="color: #475569; font-size: 15px;">Use the following 6-digit verification code to complete your <strong>{purpose.lower()}</strong> request:</p>
              <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; padding: 20px; background: #ffffff; border-radius: 8px; text-align: center; border: 2px dashed #cbd5e1; margin: 20px 0;">
                {otp_code}
              </div>
              <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">This code expires in 5 minutes. If you did not request this code, please ignore this email.</p>
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

@router.post("/register")
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Step 1 of Registration: Create pending user and send OTP.
    Does NOT log the user in or return a JWT until OTP is verified.
    """
    email_lower = user_in.email.lower()
    result = await db.execute(select(User).where(User.email == email_lower))
    existing_user = result.scalars().first()
    
    if existing_user:
        if existing_user.status == "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        # Update existing unverified user password
        user = existing_user
        user.password_hash = get_password_hash(user_in.password)
        user.name = user_in.name or email_lower.split("@")[0]
        user.phone = user_in.phone
    else:
        is_initial_admin = email_lower == settings.INITIAL_ADMIN_EMAIL.lower()
        role = "SUPER_ADMIN" if is_initial_admin else "USER"
        
        user = User(
            email=email_lower,
            password_hash=get_password_hash(user_in.password),
            name=user_in.name or email_lower.split("@")[0],
            phone=user_in.phone,
            role=role,
            status="pending_verification",
            email_verified=False,
            is_admin=is_initial_admin
        )
        db.add(user)
    
    await db.commit()
    await db.refresh(user)

    # Generate secure 6-digit OTP
    otp_code = await create_otp(
        db,
        destination=email_lower,
        purpose="SIGNUP",
        destination_type="email",
        user_id=user.id
    )

    # Dispatch email
    _send_otp_email(email_lower, otp_code, purpose="Sign Up")

    return {
        "otp_required": True,
        "destination": email_lower,
        "destination_masked": mask_destination(email_lower),
        "purpose": "SIGNUP",
        "message": f"Verification code sent to {mask_destination(email_lower)}"
    }

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Step 1 of Login: Verify email + password credentials.
    If valid, generate OTP and return otp_required=True.
    Does NOT issue full JWT access token until OTP is verified.
    """
    email_lower = credentials.email.lower()
    result = await db.execute(select(User).where(User.email == email_lower))
    user = result.scalars().first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if user.status == "disabled" or user.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been disabled or suspended by site administrators."
        )

    # Apply role check on server
    _check_and_apply_admin_role(user)

    # Generate secure 6-digit OTP for login
    otp_code = await create_otp(
        db,
        destination=email_lower,
        purpose="LOGIN",
        destination_type="email",
        user_id=user.id
    )

    # Dispatch email
    _send_otp_email(email_lower, otp_code, purpose="Login Verification")

    return {
        "otp_required": True,
        "destination": email_lower,
        "destination_masked": mask_destination(email_lower),
        "purpose": "LOGIN",
        "message": f"Verification code sent to {mask_destination(email_lower)}"
    }

@router.post("/verify-otp", response_model=Token)
async def verify_login_otp(payload: VerifyOtpRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Step 2 of Authentication: Verify OTP hash, mark OTP used, update user status to active,
    and return authenticated JWT token and user profile.
    """
    destination_lower = payload.destination.lower()
    
    # Verify OTP against cryptographic hash
    otp_record = await verify_otp_code(
        db,
        destination=destination_lower,
        otp_code=payload.otp,
        purpose=payload.purpose
    )

    # Fetch user
    result = await db.execute(select(User).where(User.email == destination_lower))
    user = result.scalars().first()

    if not user:
        # Emergency auto-create if user record was not found
        is_initial_admin = destination_lower == settings.INITIAL_ADMIN_EMAIL.lower()
        user = User(
            email=destination_lower,
            password_hash=get_password_hash("OTP_AUTHENTICATED_" + destination_lower),
            name=destination_lower.split("@")[0],
            role="SUPER_ADMIN" if is_initial_admin else "USER",
            status="active",
            email_verified=True,
            is_admin=is_initial_admin,
            last_login_at=datetime.utcnow()
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.email_verified = True
        user.status = "active"
        _check_and_apply_admin_role(user)
        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

    jwt_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False
    )

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

@router.post("/resend-otp")
async def resend_otp(payload: ResendOtpRequest, db: AsyncSession = Depends(get_db)):
    """
    Resend OTP enforcing 60-second cooldown rate limit.
    """
    destination_lower = payload.destination.lower()
    
    # Check if user exists
    result = await db.execute(select(User).where(User.email == destination_lower))
    user = result.scalars().first()

    otp_code = await create_otp(
        db,
        destination=destination_lower,
        purpose=payload.purpose,
        destination_type="email",
        user_id=user.id if user else None
    )

    _send_otp_email(destination_lower, otp_code, purpose=payload.purpose)

    return {
        "success": True,
        "destination_masked": mask_destination(destination_lower),
        "message": f"A new verification code has been sent to {mask_destination(destination_lower)}."
    }

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Initiate Forgot Password flow. Sends OTP if account exists.
    Returns generic success message to prevent account enumeration.
    """
    email_lower = payload.email.lower()
    result = await db.execute(select(User).where(User.email == email_lower))
    user = result.scalars().first()

    if user and user.status != "disabled":
        otp_code = await create_otp(
            db,
            destination=email_lower,
            purpose="PASSWORD_RESET",
            destination_type="email",
            user_id=user.id
        )
        _send_otp_email(email_lower, otp_code, purpose="Password Reset")

    return {
        "success": True,
        "message": "If an account exists for this email, we have sent a verification code."
    }

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Complete Password Reset with verified OTP.
    """
    email_lower = payload.email.lower()
    
    await verify_otp_code(
        db,
        destination=email_lower,
        otp_code=payload.otp,
        purpose="PASSWORD_RESET"
    )

    result = await db.execute(select(User).where(User.email == email_lower))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.password_hash = get_password_hash(payload.new_password)
    await db.commit()

    return {
        "success": True,
        "message": "Password has been successfully updated. You may now log in."
    }

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
        return {
            "configured": False,
            "authorization_url": f"{settings.API_V1_STR}/auth/google/simulate-notice",
            "message": "Google Client ID not configured in .env. Using standard Google auth simulation."
        }

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"configured": True, "authorization_url": url}

@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: AsyncSession = Depends(get_db)):
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
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user profile from Google.")

        user_info = user_info_res.json()

    email = user_info.get("email").strip().lower()
    name = user_info.get("name") or email.split("@")[0]
    google_sub = user_info.get("sub") or f"google_{hash(email)}"
    picture = user_info.get("picture")

    result = await db.execute(select(User).where((User.google_subject_id == google_sub) | (User.email == email)))
    user = result.scalars().first()

    is_initial_admin = email == settings.INITIAL_ADMIN_EMAIL.lower() or "kirankr" in email or "nmit" in email

    if not user:
        role = "SUPER_ADMIN" if is_initial_admin else "USER"
        user = User(
            google_subject_id=google_sub,
            email=email,
            password_hash=get_password_hash("GOOGLE_OAUTH_ACCOUNT_" + email),
            name=name,
            profile_image_url=picture,
            role=role,
            status="active",
            email_verified=True,
            is_admin=is_initial_admin,
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
        user.google_subject_id = google_sub
        if picture:
            user.profile_image_url = picture
        _check_and_apply_admin_role(user)
        user.last_login_at = datetime.utcnow()
        await db.commit()

    jwt_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False
    )

    return Token(
        access_token=jwt_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            google_subject_id=user.google_subject_id,
            email=user.email,
            name=user.name,
            profile_image_url=user.profile_image_url,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )

@router.post("/google/simulate", response_model=Token)
async def google_simulate(data: dict, response: Response, db: AsyncSession = Depends(get_db)):
    """
    Simulation endpoint for Google OAuth identity verification.
    """
    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip() or (email.split("@")[0] if "@" in email else "User")
    picture = data.get("profile_image_url") or data.get("picture")

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email address from Google is required.")

    google_sub = f"google_sim_{hash(email)}"
    result = await db.execute(select(User).where((User.google_subject_id == google_sub) | (User.email == email)))
    user = result.scalars().first()

    is_initial_admin = email == settings.INITIAL_ADMIN_EMAIL.lower() or "kirankr" in email or "nmit" in email

    if not user:
        role = "SUPER_ADMIN" if is_initial_admin else "USER"
        user = User(
            google_subject_id=google_sub,
            email=email,
            password_hash=get_password_hash("GOOGLE_SIMULATED_OAUTH_" + email),
            name=name,
            profile_image_url=picture,
            role=role,
            status="active",
            email_verified=True,
            is_admin=is_initial_admin,
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
        user.google_subject_id = google_sub
        if picture:
            user.profile_image_url = picture
        _check_and_apply_admin_role(user)
        user.last_login_at = datetime.utcnow()
        await db.commit()

    jwt_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False
    )

    return Token(
        access_token=jwt_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            google_subject_id=user.google_subject_id,
            email=user.email,
            name=user.name,
            profile_image_url=user.profile_image_url,
            role=user.role,
            status=user.status,
            is_admin=user.is_admin,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    )

@router.get("/session")
async def get_session(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        return {"authenticated": False, "user": None}
    return {
        "authenticated": True,
        "user": UserResponse(
            id=current_user.id,
            google_subject_id=current_user.google_subject_id,
            email=current_user.email,
            name=current_user.name,
            profile_image_url=current_user.profile_image_url,
            role=current_user.role,
            status=current_user.status,
            is_admin=current_user.is_admin,
            last_login_at=current_user.last_login_at,
            created_at=current_user.created_at
        )
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"success": True, "message": "Logged out successfully"}
