from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    original_price = Column(Float, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    offer_price = Column(Float, nullable=False)
    offer_status = Column(String, default="Active")
