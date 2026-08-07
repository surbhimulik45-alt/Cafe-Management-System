from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey
from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    items = Column(String, nullable=False)   # JSON-encoded list of item names
    total_price = Column(Float, nullable=False)
    status = Column(String, default="Pending")
