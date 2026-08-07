from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Nutrition(Base):
    __tablename__ = "nutrition"

    id = Column(Integer, primary_key=True, index=True)

    menu_id = Column(Integer, ForeignKey("menu.id"), nullable=False)

    item_name = Column(String, nullable=False)

    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    carbohydrates = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)