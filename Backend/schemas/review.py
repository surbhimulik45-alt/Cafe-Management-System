from pydantic import BaseModel
from typing import Optional


class ReviewBase(BaseModel):
    user_id: int
    menu_id: int
    item_name: str
    rating: float
    review: str


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int

    class Config:
        from_attributes = True
