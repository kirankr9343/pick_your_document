# Authentication & Role Routing Validation Matrix

The following test suite validates the security enforcement and post-login routing behavior of Pick Your Document.

| # | Test Scenario | Inputs / Action | Expected Behavior | Status |
| :-: | :--- | :--- | :--- | :-: |
| 1 | Google Normal User Login | Google account `user@gmail.com` | Authenticates -> Role `USER` -> Redirects to `/dashboard` | **PASS** |
| 2 | Google Admin Login | Google account `kirankr93439343@gmail.com` | Authenticates -> Role `SUPER_ADMIN` -> Redirects to `/admin` | **PASS** |
| 3 | Normal User Access Admin Page | Logged in as `user@gmail.com` -> Navigate to `/admin` | Access denied (403 Forbidden) | **PASS** |
| 4 | Unauthenticated User Access Admin Page | Unauthenticated -> Navigate to `/admin` | Access denied -> Redirects to Sign In | **PASS** |
| 5 | Request Body Role Tampering | POST payload `{ "role": "SUPER_ADMIN" }` | Request role ignored -> Server assigns `USER` | **PASS** |
| 6 | Browser LocalStorage Modification | Set `localStorage.role = "SUPER_ADMIN"` | Client modification has no effect -> Backend returns 403 for admin APIs | **PASS** |
| 7 | User Logout | Click Logout button | Token invalidated, HttpOnly cookie cleared, session destroyed | **PASS** |
| 8 | Reuse Invalidated Session Token | Request `/api/v1/admin/users` after logout | HTTP 401 Unauthorized | **PASS** |
| 9 | Local vs Production Google OAuth | Test OAuth config endpoints | Validates `GOOGLE_CLIENT_ID` & callback URL dynamically | **PASS** |
