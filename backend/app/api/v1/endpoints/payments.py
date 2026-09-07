from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.models import User, Payment
from app.schemas.schemas import UtrPaymentRequest, PaymentResponse
from app.api.deps import get_current_user
from app.services.payment_service import submit_utr_payment

router = APIRouter()

@router.post("/utr", response_model=PaymentResponse)
async def create_utr_payment(
    payload: UtrPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submits a UTR/UPI reference payment.
    Enforces duplicate UTR check and assigns status PENDING_REVIEW for admin verification queue.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to submit payment.")

    try:
        payment = await submit_utr_payment(
            db=db,
            user=current_user,
            utr=payload.utr,
            amount=payload.amount,
            plan=payload.plan
        )
        return PaymentResponse(
            id=payment.id,
            user_id=payment.user_id,
            user_email=current_user.email,
            order_id=payment.order_id,
            gateway=payment.gateway,
            gateway_payment_id=payment.gateway_payment_id,
            utr=payment.utr,
            amount=payment.amount,
            currency=payment.currency,
            plan=payment.plan,
            status=payment.status,
            verification_method=payment.verification_method,
            created_at=payment.created_at,
            verified_at=payment.verified_at
        )
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

@router.get("/my-payments", response_model=List[PaymentResponse])
async def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns payment history for current logged-in user.
    """
    res = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(desc(Payment.created_at))
    )
    payments = res.scalars().all()
    
    return [
        PaymentResponse(
            id=p.id,
            user_id=p.user_id,
            user_email=current_user.email,
            order_id=p.order_id,
            gateway=p.gateway,
            gateway_payment_id=p.gateway_payment_id,
            utr=p.utr,
            amount=p.amount,
            currency=p.currency,
            plan=p.plan,
            status=p.status,
            verification_method=p.verification_method,
            created_at=p.created_at,
            verified_at=p.verified_at
        ) for p in payments
    ]
