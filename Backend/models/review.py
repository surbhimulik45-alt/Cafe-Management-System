from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menu.id"), nullable=False)
    item_name = Column(String, nullable=False)
    rating = Column(Float, nullable=False)
    review = Column(String, nullable=False)
