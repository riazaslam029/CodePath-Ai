"""
Payment processing API endpoints.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.payment_service import payment_service_instance

router = APIRouter(prefix="/payments", tags=["payments"])

class ChargePayload(BaseModel):
    amount: float
    currency: str = "USD"

@router.post("/charge")
def charge(payload: ChargePayload):
    """Processes a subscription or one-time charge."""
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    receipt = payment_service_instance.charge_account(user_id=1, amount=payload.amount, currency=payload.currency)
    return receipt
