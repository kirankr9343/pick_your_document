# Authentication Architecture & Session Specification

## Overview

Pick Your Document implements a unified **Google OAuth 2.0 Authentication Flow** with server-side role assignment and automatic post-login routing.

- **Single Sign-In Experience**: Users click one **"Continue with Google"** button. No separate admin vs user login forms.
- **Server-Controlled Authorization**: Role evaluation (`SUPER_ADMIN` vs `USER`) is performed exclusively by the backend based on `INITIAL_ADMIN_EMAIL` configuration.
- **No Password Storage**: Gmail passwords are never collected or stored.

---

## Authentication Flow Diagram

```
User clicks "Continue with Google"
  │
  ▼
GET /api/v1/auth/google/login
  │
  ▼
Google OAuth 2.0 Consent Screen (accounts.google.com)
  │
  ▼
User authenticates with Google
  │
  ▼
Google redirects to GET /api/v1/auth/google/callback?code=...
  │
  ▼
Backend exchanges code for Google Access Token & Profile (sub, email, name)
  │
  ▼
Backend checks email against INITIAL_ADMIN_EMAIL (kirankr93439343@gmail.com)
  ├── MATCH    ──> Role = SUPER_ADMIN, is_admin = True
  └── NO MATCH ──> Role = USER, is_admin = False
  │
  ▼
Backend creates/updates user in DB & sets HttpOnly Access Token Cookie
  │
  ▼
Frontend receives session -> Auto-routes:
  ├── Admin      ──> /admin (Admin Dashboard)
  └── Normal User ──> /dashboard (User Dashboard)
```

---

## API Endpoints

### 1. `GET /api/v1/auth/google/login`
Returns the OAuth authorization URL for Google sign-in.

### 2. `GET /api/v1/auth/google/callback`
Processes the authorization code from Google, verifies user identity, assigns server-side roles, and creates a secure session.

### 3. `POST /api/v1/auth/google/simulate`
Identity verification endpoint for development & testing environments when Google Client ID is unconfigured. Applies identical server-side role mapping rules.

### 4. `GET /api/v1/auth/session`
Returns current session authentication state and user details.
```json
{
  "authenticated": true,
  "user": {
    "id": "usr_...",
    "email": "kirankr93439343@gmail.com",
    "name": "Super Admin",
    "role": "SUPER_ADMIN",
    "is_admin": true
  }
}
```

### 5. `POST /api/v1/auth/logout`
Invalidates authentication tokens and clears HttpOnly cookies.
