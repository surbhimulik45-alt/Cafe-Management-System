from pydantic import BaseModel
from typing import Optional


class FavoriteBase(BaseModel):
    user_id: int
    menu_id: int
    item_name: str


class FavoriteCreate(FavoriteBase):
    pass


class FavoriteResponse(FavoriteBase):
    id: int

    class Config:
        from_attributes = True
