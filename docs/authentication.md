# Authentication Architecture Documentation

## Overview
Pick Your Document implements a production-grade 2-Step Authentication Architecture combining Email + Password credentials with Cryptographically Secure OTP Verification for both normal users and site administrators.

## Core Principles
1. **Server-Enforced Roles**: No client-side role switching or special frontend-only admin login URLs exist. Roles (`USER`, `ADMIN`, `SUPER_ADMIN`) are assigned strictly on the server based on verified identity.
2. **Initial Administrator**: `kirankr93439343@gmail.com` is automatically promoted to `SUPER_ADMIN` on the server and MUST complete OTP verification on every login.
3. **Unified Login Route**: All accounts authenticate through `POST /api/v1/auth/login` and `POST /api/v1/auth/verify-otp`. Post-verification, the server routes `SUPER_ADMIN` and `ADMIN` users to `/admin` and `USER` role to `/dashboard`.

## Authentication Flow
```
User / Admin
    ↓
Email + Password Submitted (POST /api/v1/auth/login)
    ↓
Server Verifies Password Hash & Account Status
    ↓
Server Generates Cryptographically Secure 6-Digit OTP (SHA-256 Hashed in Database)
    ↓
OTP Dispatched via SMTP Email / SMS Provider
    ↓
Server Returns: { "otp_required": true, "destination_masked": "k***3@gmail.com" }
    ↓
Client Displays 6-Digit OTP Verification Screen
    ↓
User / Admin Enters 6-Digit OTP Code (POST /api/v1/auth/verify-otp)
    ↓
Server Verifies Hash, Expiry, and Attempt Count
    ↓
JWT Access Token & HttpOnly Cookie Created
    ↓
Server Checks Role → Redirects to /admin (Admin) or /dashboard (User)
```

## Security Controls
- **Password Security**: Argon2id / bcrypt hashing with minimum length enforcement. Plaintext passwords are never logged or stored.
- **Session Security**: HttpOnly, Secure, SameSite=Lax JWT cookies with server-side revocation support.
- **Account Locking**: Users in `disabled` or `suspended` status are rejected at step 1 before OTP generation.
