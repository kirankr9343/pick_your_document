# Google OAuth 2.0 Integration & Identity Routing

## Overview
Pick Your Document supports Google OAuth 2.0 login as an optional authentication mechanism. Both standard Email/Password + OTP and Google OAuth log into the same backend account system.

## Unified OAuth Flow
1. User clicks **Continue with Google** on the unified authentication modal.
2. Google OAuth 2.0 verifies user identity and returns authorization code to `/api/v1/auth/google/callback`.
3. Server exchanges code for Google Access Token and fetches verified email profile (`sub`, `email`, `name`).
4. Server searches `users` table by `google_subject_id` or `email`:
   - If user exists, links `google_subject_id` if missing and updates `last_login_at`.
   - If user is new, creates active account with `email_verified=True`.
5. Server determines role based on `INITIAL_ADMIN_EMAIL` configuration:
   - `kirankr93439343@gmail.com` $\rightarrow$ `SUPER_ADMIN` $\rightarrow$ `/admin`
   - Normal users $\rightarrow$ `USER` $\rightarrow$ `/dashboard`

## Simulation & Fallback Mode
When `GOOGLE_CLIENT_ID` is not configured in `.env`, the client triggers server-side simulation at `/api/v1/auth/google/simulate`, preserving 100% server role checks and user creation logic.
