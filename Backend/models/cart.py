from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base

class Cart(Base):
    __tablename__ = "cart"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menu.id"), nullable=False)

    item_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)