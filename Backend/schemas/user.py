from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    password: str
    role: Optional[str] = "Customer"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: Optional[str] = "Customer"

    class Config:
        from_attributes = True
