from pydantic import BaseModel


class MenuBase(BaseModel):
    name: str
    category: str
    price: float
    image: str
    rating: str
    nutrition: str
    preference: str = "Veg"
    spice_level: str = "Mild"


class MenuCreate(MenuBase):
    pass


class MenuUpdate(MenuBase):
    pass


class MenuResponse(MenuBase):
    id: int

    class Config:
        from_attributes = True