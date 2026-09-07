from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.models import Payment, Subscription, User, AdminAuditLog

class PaymentVerificationService:
    @staticmethod
    async def submit_utr_payment(
        db: AsyncSession,
        user_id: str,
        utr_code: str,
        amount: float,
        plan_name: str = "Pro Plan",
        currency: str = "INR"
    ) -> Payment:
        clean_utr = utr_code.strip().upper()
        if not clean_utr or len(clean_utr) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid 12-digit UTR / Bank Reference Number is required."
            )

        # Duplicate UTR Check
        stmt = select(Payment).where(
            Payment.utr == clean_utr,
            Payment.status.in_(["SUCCESS", "PENDING_REVIEW"])
        )
        res = await db.execute(stmt)
        existing = res.scalars().first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="REJECT_DUPLICATE: This UTR / Reference Number has already been submitted or processed."
            )

        payment = Payment(
            user_id=user_id,
            order_id="ORD_" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
            gateway="upi_manual",
            utr=clean_utr,
            amount=amount,
            currency=currency,
            plan=plan_name,
            status="PENDING_REVIEW",
            verification_method="ADMIN_MANUAL"
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def admin_review_payment(
        db: AsyncSession,
        payment_id: str,
        admin_user: User,
        approve: bool
    ) -> Payment:
        stmt = select(Payment).where(Payment.id == payment_id)
        res = await db.execute(stmt)
        payment = res.scalars().first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment record not found."
            )

        if payment.status == "SUCCESS" and approve:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is already approved."
            )

        new_status = "SUCCESS" if approve else "FAILED"
        payment.status = new_status
        payment.verified_at = datetime.utcnow()

        if approve:
            # Activate user subscription
            sub_stmt = select(Subscription).where(Subscription.user_id == payment.user_id)
            sub_res = await db.execute(sub_stmt)
            sub = sub_res.scalars().first()
            if not sub:
                sub = Subscription(
                    user_id=payment.user_id,
                    plan=payment.plan.lower(),
                    status="active",
                    provider="manual_review"
                )
                db.add(sub)
            else:
                sub.plan = payment.plan.lower()
                sub.status = "active"

        # Log Admin Audit Event
        audit_log = AdminAuditLog(
            admin_user_id=admin_user.id,
            admin_email=admin_user.email,
            action="PAYMENT_VERIFICATION",
            target_type="payment",
            target_id=payment.id,
            metadata_json=f'{{"status": "{new_status}", "utr": "{payment.utr}", "amount": {payment.amount}}}'
        )
        db.add(audit_log)

        await db.commit()
        await db.refresh(payment)
        return payment

async def admin_review_payment(
    db: AsyncSession,
    payment_id: str,
    admin_user: User,
    approve: bool
) -> Payment:
    """Module-level wrapper for admin review of payment."""
    return await PaymentVerificationService.admin_review_payment(
        db=db,
        payment_id=payment_id,
        admin_user=admin_user,
        approve=approve
    )

async def submit_utr_payment(
    db: AsyncSession,
    user_id: str,
    utr_code: str,
    amount: float,
    plan_name: str = "Pro Plan",
    currency: str = "INR"
) -> Payment:
    """Module-level wrapper for submit_utr_payment."""
    return await PaymentVerificationService.submit_utr_payment(
        db=db,
        user_id=user_id,
        utr_code=utr_code,
        amount=amount,
        plan_name=plan_name,
        currency=currency
    )


