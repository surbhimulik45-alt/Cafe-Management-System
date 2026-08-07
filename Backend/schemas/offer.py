from pydantic import BaseModel
from typing import Optional


class OfferBase(BaseModel):
    item_name: str
    description: str
    original_price: float
    discount_percentage: float
    offer_price: float
    offer_status: Optional[str] = "Active"


class OfferCreate(OfferBase):
    pass


class OfferUpdate(OfferBase):
    pass


class OfferResponse(OfferBase):
    id: int

    class Config:
        from_attributes = True
