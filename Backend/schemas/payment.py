from pydantic import BaseModel
from typing import Optional


class PaymentBase(BaseModel):
    user_id: int
    order_id: int
    amount: float
    payment_method: str
    payment_status: Optional[str] = "Pending"
    transaction_id: Optional[str] = None
    qr_code: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: int

    class Config:
        from_attributes = True
