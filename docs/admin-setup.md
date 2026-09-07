# Admin Dashboard & Role-Based Access Control (RBAC) Setup Guide

This document explains the security architecture, initial super-admin assignment, RBAC roles, admin REST endpoints, tool toggling engine enforcement, and audit logs for **Pick Your Document**.

---

## 1. Initial Super-Admin Configuration

The system is configured with server-side super-admin auto-promotion:
```env
INITIAL_ADMIN_EMAIL=kirankr93439343@gmail.com
```

### Server-Side Auto-Promotion Rules
When `kirankr93439343@gmail.com` logs in via **Google OAuth 2.0** or **Email Sign-In**:
1. The backend inspects `user.email.lower() == settings.INITIAL_ADMIN_EMAIL.lower()`.
2. It automatically sets `user.role = "SUPER_ADMIN"` and `user.is_admin = True`.
3. It updates `user.last_login_at` and issues a signed JWT token containing `role: SUPER_ADMIN`.
4. Client browsers cannot assign or alter roles.

---

## 2. Role-Based Access Control (RBAC) System

| Role | Permissions | Access |
| :--- | :--- | :--- |
| `USER` | Standard conversion tools, history, download output files. | Public & Member routes. `403 Forbidden` on `/admin`. |
| `ADMIN` | Access `/admin` dashboard, view metrics, users, jobs, error logs, system status, toggle tools, audit logs. | `/admin/*` protected endpoints. |
| `SUPER_ADMIN` | All `ADMIN` capabilities + manage `ADMIN`/`SUPER_ADMIN` user roles and system configuration. | Full system administrative access. |

---

## 3. Admin REST API Endpoints

All admin endpoints are located under `/api/v1/admin` and require a valid JWT token issued to an `ADMIN` or `SUPER_ADMIN` account:

- `GET /api/v1/admin/dashboard` — Platform overview metrics (total users, new users today, conversions, success rate %, total file size, active jobs, expired files count, top tools).
- `GET /api/v1/admin/users` — Paginated user listing with search (`q`), role filter, and status filter (`active`, `disabled`).
- `GET /api/v1/admin/users/{id}` — Detailed user profile + recent 20 processing jobs.
- `PATCH /api/v1/admin/users/{id}/role` — Update user role (`USER`, `ADMIN`, `SUPER_ADMIN`). Audit logged.
- `PATCH /api/v1/admin/users/{id}/status` — Enable or disable account (`active`, `disabled`). Audit logged.
- `GET /api/v1/admin/jobs` — Paginated job execution logs with status filter and search.
- `GET /api/v1/admin/errors` — Logged conversion failure details (error code, safe error message, duration).
- `GET /api/v1/admin/tools` — List registered tools with `enabled` status, category, usage counts, and success rates.
- `PATCH /api/v1/admin/tools/{tool_id}` — Enable/disable tool. Audit logged. Backend conversion endpoints check tool status before execution.
- `GET /api/v1/admin/analytics` — Conversion telemetry across daily dates and tool popularity.
- `GET /api/v1/admin/system` — Health monitors for backend API, database connection, storage directory, OCR tesseract, and AI provider.
- `GET /api/v1/admin/audit-logs` — Paginated administrative audit logs.

---

## 4. Testing Admin Privileges

### Test Super-Admin Login (`kirankr93439343@gmail.com`):
1. Start backend server: `$env:PYTHONPATH="backend"; python -m uvicorn app.main:app --reload --port 8000`
2. Start frontend dev server: `cd frontend; npm run dev`
3. Click **Sign In** and authenticate with `kirankr93439343@gmail.com`.
4. The navigation header displays the **Shield / Admin** button.
5. Click **Admin** to access `/admin` dashboard.

### Test Normal User Restriction:
1. Sign up/log in with a standard email (e.g. `user@example.com`).
2. Attempting to open `/admin` displays the styled **403 Forbidden — Access Denied** screen.
3. Backend API requests to `/api/v1/admin/*` return HTTP `403 Forbidden`.
