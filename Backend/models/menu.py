from sqlalchemy import Column, Integer, String, Float
from database import Base


class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String)
    category = Column(String)
    rating = Column(String)
    nutrition = Column(String)
    preference = Column(String, default="Veg")
    spice_level = Column(String, default="Mild")