from pydantic import BaseModel
from typing import Optional


class OrderTrackingBase(BaseModel):
    order_id: int
    user_id: int
    order_status: Optional[str] = "Order Received"


class OrderTrackingCreate(OrderTrackingBase):
    pass


class OrderTrackingUpdate(OrderTrackingBase):
    pass


class OrderTrackingResponse(OrderTrackingBase):
    id: int

    class Config:
        from_attributes = True
