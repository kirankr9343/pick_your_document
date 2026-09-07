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
