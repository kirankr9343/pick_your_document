# Admin Security & Authorization Specification

## Overview
This document outlines the security controls protecting administrative endpoints, super-admin privileges, and audit logging in Pick Your Document.

## Roles & Hierarchy
- `SUPER_ADMIN`: Initial Administrator (`kirankr93439343@gmail.com`). Full control over user role management, system tools, payments, and audit logs.
- `ADMIN`: Site administrator. Can view metrics, manage tools, review UTR payments, and view logs.
- `USER`: Standard registered user. Access restricted to `/dashboard` and conversion tools.

## Mandatory Admin 2-Step OTP Verification
- Administrators log in through the exact same unified login page.
- Entering admin email (`kirankr93439343@gmail.com`) and password verifies credentials and sends a 6-digit OTP code to the admin's verified email.
- The administrator MUST enter the 6-digit OTP code. OTP verification cannot be bypassed for admins.
- Post OTP verification, the server checks the role (`SUPER_ADMIN`) and automatically routes the administrator to `/admin`.

## Protected Backend Endpoints
All `/api/v1/admin/*` endpoints enforce `get_current_admin` or `get_current_super_admin` dependencies:
- `/api/v1/admin/dashboard`
- `/api/v1/admin/users`
- `/api/v1/admin/users/{user_id}/role`
- `/api/v1/admin/users/{user_id}/status`
- `/api/v1/admin/jobs`
- `/api/v1/admin/tools`
- `/api/v1/admin/payments`
- `/api/v1/admin/payments/{payment_id}/review`
- `/api/v1/admin/audit-logs`

Attempts by non-admin users to call these endpoints return `403 Forbidden`.

## Audit Logging (`admin_audit_logs`)
The system records all administrative actions:
- `ADMIN_LOGIN_SUCCESS`
- `ADMIN_LOGIN_FAILED`
- `ROLE_CHANGE`
- `STATUS_CHANGE`
- `TOOL_TOGGLE`
- `PAYMENT_APPROVE`
- `PAYMENT_REJECT`

Sensitives (passwords, OTP hashes, payment secrets) are never recorded in logs.
