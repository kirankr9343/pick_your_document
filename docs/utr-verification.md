# UTR Verification & Anti-Fraud Specification

## Overview
This specification details the anti-fraud mechanisms implemented for UTR (Unique Transaction Reference) / UPI payments in Pick Your Document.

## Anti-Fraud Architecture

### 1. Duplicate UTR Protection
Every submitted UTR is indexed in the `payments` table. Before accepting any submission:
- The system searches `payments` where `utr = input_utr` AND `status = 'SUCCESS'`.
- If a match is found, the request is immediately rejected with error code `REJECT_DUPLICATE`.
- This prevents malicious users from reusing transaction reference numbers.

### 2. Verification Service Abstraction (`PaymentVerificationService`)
- `GatewayVerificationService`: Direct API reconciliation against Razorpay / Bank APIs.
- `ManualReviewService`: Places submissions into `PENDING_REVIEW` status for Admin review on `/admin`.

### 3. Payment Database Table (`payments`)
| Column | Type | Description |
|---|---|---|
| `id` | VARCHAR(36) | Primary Key UUID |
| `user_id` | VARCHAR(36) | Foreign Key to users |
| `order_id` | VARCHAR(100) | Gateway Order ID |
| `gateway` | VARCHAR(50) | `RAZORPAY`, `UPI_MANUAL` |
| `gateway_payment_id` | VARCHAR(100) | Gateway Payment ID |
| `utr` | VARCHAR(100) | 12-Digit Bank Reference |
| `amount` | FLOAT | Transaction Amount |
| `currency` | VARCHAR(10) | `INR` |
| `plan` | VARCHAR(50) | `PRO`, `BUSINESS` |
| `status` | VARCHAR(50) | `CREATED`, `PENDING_REVIEW`, `SUCCESS`, `FAILED`, `DUPLICATE` |
| `verification_method` | VARCHAR(50) | `AUTOMATIC_GATEWAY`, `MANUAL_ADMIN_REVIEW` |
| `created_at` | DATETIME | Creation timestamp |
| `verified_at` | DATETIME | Approval / verification timestamp |

### 4. Admin Audit Trail
When an administrator approves or rejects a UTR:
- An entry is recorded in `admin_audit_logs` with `action="PAYMENT_APPROVE"` or `action="PAYMENT_REJECT"`, `admin_user_id`, `admin_email`, `payment_id`, and timestamp.
