# Administrator Role Management & Security Architecture

## Initial Super-Admin Assignment

The application's initial super-administrator email is configured via server environment:

```env
INITIAL_ADMIN_EMAIL=kirankr93439343@gmail.com
```

### Assignment Policy
1. When `kirankr93439343@gmail.com` authenticates via Google OAuth, the backend compares the verified email against `INITIAL_ADMIN_EMAIL`.
2. Upon match, the backend assigns `role = "SUPER_ADMIN"` and `is_admin = True`.
3. Audit entry is recorded in `admin_audit_logs`.
4. All other Google accounts receive `role = "USER"`.

---

## Role-Based Access Control (RBAC) Matrix

| Endpoint / Feature | USER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: |
| `/tools` & Converters | ✅ | ✅ | ✅ |
| `/dashboard` | ✅ | ✅ | ✅ |
| `/admin` & `/admin/dashboard` | ❌ 403 | ✅ | ✅ |
| `/api/v1/admin/users` | ❌ 403 | ✅ | ✅ |
| `/api/v1/admin/users/{id}/role` | ❌ 403 | ❌ 403 | ✅ |
| `/api/v1/admin/tools/{id}` | ❌ 403 | ✅ | ✅ |
| `/api/v1/admin/audit-logs` | ❌ 403 | ❌ 403 | ✅ |

---

## Security Boundary Rules

- **Server-Side Enforcement**: Authorization decisions depend exclusively on DB role checks in backend dependencies (`get_current_admin`, `get_current_super_admin`).
- **No Client Forgery**: Modifying `localStorage`, cookies, JavaScript state, or request headers on the client will NOT grant access to `/api/v1/admin/*` endpoints. Backend rejects unauthorized requests with `403 Forbidden`.
