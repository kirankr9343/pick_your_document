# Security Architecture & Vulnerability Protections

## 1. Zero Trust Client Principles
- The frontend is considered an untrusted presentation layer.
- All authorization decisions (`USER`, `ADMIN`, `SUPER_ADMIN`) are enforced on the backend via FastAPI dependencies (`get_current_user`, `get_current_admin`, `get_current_super_admin`).
- Request body role tampering (e.g. `{ "role": "SUPER_ADMIN" }`) or query parameter manipulation is ignored during registration/authentication.

## 2. Password Safety
- The application uses Google OAuth 2.0.
- Gmail passwords are **never requested, collected, or stored**.

## 3. Session & Cookie Security
- Authentication tokens are issued as signed JWTs using HMAC-SHA256 (`SECRET_KEY`).
- Cookies are set with `HttpOnly=True` and `SameSite=Lax` to prevent XSS credential theft.

## 4. Environment Secret Protection
- Secrets (`SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, `SMTP_PASSWORD`) are stored in `.env` files which are excluded via `.gitignore`.
- `.env.example` provides safe default placeholders.
