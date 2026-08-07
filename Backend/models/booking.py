from sqlalchemy import Column, Integer, String, Date, Time
from database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    customer_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    table_type = Column(String, nullable=False)
    number_of_people = Column(Integer, nullable=False)
    booking_date = Column(String, nullable=False)
    booking_time = Column(String, nullable=False)
    status = Column(String, default="Booked")
