# Security Architecture & File Handling

Security is a primary requirement of Pick Your Document.

## Threat Protection Measures

1. **Path Traversal Protection**:
   All user-supplied filenames are sanitized using regex filtering (`sanitize_filename()`). Internal files are saved using cryptographically random UUID hex tokens (`uuid.uuid4().hex`). All internal path access is strictly verified with path assertion (`full_path.startswith(temp_dir_abs)`).

2. **File Validation & Limits**:
   File sizes are capped at 50MB per upload. Extensions are validated against a strict whitelist before processing.

3. **Automated Temporary Storage Purge**:
   No permanent file retention. Uploaded and generated files are automatically deleted by a background worker task after processing and after 2 hours maximum.

4. **Authentication & Password Hashing**:
   Passwords are hashed using salted `bcrypt`. Authorization tokens use standard HS256 JWTs.

5. **Rate Limiting**:
   API endpoints enforce IP-based rate limiting for anonymous users and account-based limits for authenticated users.
