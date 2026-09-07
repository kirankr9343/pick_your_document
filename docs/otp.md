# OTP Verification Architecture

## Overview
All OTP verification codes in Pick Your Document are generated server-side using cryptographically secure random sources (`secrets.SystemRandom`), hashed with SHA-256 before database storage, and delivered to verified destinations.

## Security Rules
1. **Never Plaintext**: Raw 6-digit OTP codes are never stored in the database or exposed in API responses. Only SHA-256 hashes (`otp_hash`) are persisted in `otp_verifications`.
2. **Short Expiry**: OTP codes expire in 5 minutes (`OTP_EXPIRY_MINUTES=5`).
3. **Attempt Limit**: Maximum 5 failed verification attempts per code (`OTP_MAX_ATTEMPTS=5`). Reaching 5 attempts invalidates the OTP.
4. **Resend Cooldown**: Enforces a 60-second resend cooldown timer (`OTP_RESEND_COOLDOWN_SECONDS=60`).
5. **Single Use**: Upon successful verification, `used_at` timestamp is set and the OTP cannot be reused.

## OTP Database Schema (`otp_verifications`)
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(36) | Primary Key UUID |
| `user_id` | VARCHAR(36) | Foreign key to users table |
| `destination` | VARCHAR(255) | Recipient email or phone |
| `destination_type` | VARCHAR(20) | `email` or `sms` |
| `otp_hash` | VARCHAR(255) | SHA-256 hash of 6-digit code |
| `purpose` | VARCHAR(50) | `LOGIN`, `SIGNUP`, `PASSWORD_RESET` |
| `expires_at` | DATETIME | Expiration timestamp |
| `attempt_count` | INTEGER | Failed attempt counter |
| `used_at` | DATETIME | Timestamp when verified |
| `created_at` | DATETIME | Generation timestamp |

## Provider Abstraction (`OtpProvider`)
Supports modular delivery providers:
- `EmailOtpProvider`: SMTP email dispatch to user inbox.
- `SmsOtpProvider`: Modular SMS provider abstraction via environment variables (`SMS_PROVIDER`, `SMS_API_KEY`).
