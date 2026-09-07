# Payment Gateway & Subscription Architecture

## Overview
Pick Your Document offers Free, Pro, and Business plans with support for Indian Payment Gateways (Razorpay / UPI Integration) and Manual UTR Bank Reconciliation queues.

## Payment Flow Options

### 1. Official Gateway Checkout Flow (Preferred)
```
User Selects Package
    ↓
Server Creates Gateway Order (POST /api/v1/payments/create-order)
    ↓
Razorpay Checkout Modal Opens
    ↓
Payment Executed by Customer
    ↓
Gateway Webhook Received (POST /api/v1/payments/webhook)
    ↓
Server Verifies Webhook HMAC SHA-256 Signature
    ↓
Subscription Activated (`status = SUCCESS`, `user.is_pro = True`)
```

### 2. Manual UTR Bank Reconciliation Queue Flow
When customer completes payment via UPI QR code (Google Pay / PhonePe / Paytm / BHIM) to merchant account (`kirankr93439343@upi`):
```
User Enters 12-Digit UTR Reference
    ↓
Submitted to POST /api/v1/payments/utr
    ↓
Backend Checks Database for Duplicate UTR
    ├─ If UTR already exists in SUCCESS transaction → REJECT_DUPLICATE (400 Bad Request)
    └─ If UTR is new → Store in `payments` table with `status = PENDING_REVIEW`
    ↓
User Informed: "UTR submitted for bank verification"
    ↓
Admin Opens /admin → Payment Verification Queue
    ↓
Admin Approves or Rejects Payment
    ├─ Approve → payment.status = SUCCESS, Subscription Activated
    └─ Reject → payment.status = FAILED, Audit Logged
```

## Security Rules
- No arbitrary UTR length checks (e.g. `utr.length > 8 == verified`).
- Frontend "payment successful" messages are never trusted as proof of payment.
- Subscriptions ONLY activate upon backend verification or Admin manual approval.
