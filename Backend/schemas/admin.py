from pydantic import BaseModel
from typing import Optional


class AdminBase(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Admin"
    is_active: Optional[bool] = True


class AdminCreate(AdminBase):
    password: str


class AdminUpdate(AdminBase):
    password: Optional[str] = None


class AdminResponse(AdminBase):
    id: int

    class Config:
        from_attributes = True
