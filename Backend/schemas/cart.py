from pydantic import BaseModel

class CartBase(BaseModel):
    user_id: int
    menu_id: int
    item_name: str
    quantity: int
    price: float
    total_price: float


class CartCreate(CartBase):
    pass


class CartUpdate(CartBase):
    pass


class CartResponse(CartBase):
    id: int

    class Config:
        from_attributes = True