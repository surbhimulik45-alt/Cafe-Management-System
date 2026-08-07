from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menu.id"), nullable=False)
    item_name = Column(String, nullable=False)
