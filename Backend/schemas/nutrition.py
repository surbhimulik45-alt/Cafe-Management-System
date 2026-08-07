from pydantic import BaseModel
from typing import Optional


class NutritionBase(BaseModel):
    menu_id: int
    item_name: str
    calories: float
    protein: float
    carbohydrates: float
    fat: float


class NutritionCreate(NutritionBase):
    pass


class NutritionUpdate(NutritionBase):
    pass


class NutritionResponse(NutritionBase):
    id: int

    class Config:
        from_attributes = True
