from pydantic import BaseModel
from typing import Optional, List


class OrderBase(BaseModel):
    customer_name: str
    user_id: Optional[int] = None
    items: str        # JSON string or comma-separated item names
    total_price: float
    status: Optional[str] = "Pending"


class OrderCreate(OrderBase):
    pass


class OrderUpdate(OrderBase):
    pass


class OrderResponse(OrderBase):
    id: int

    class Config:
        from_attributes = True
