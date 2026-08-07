from pydantic import BaseModel
from typing import Optional


class BookingBase(BaseModel):
    user_id: int
    customer_name: str
    phone_number: str
    table_type: str
    number_of_people: int
    booking_date: str
    booking_time: str
    status: Optional[str] = "Booked"


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int

    class Config:
        from_attributes = True
