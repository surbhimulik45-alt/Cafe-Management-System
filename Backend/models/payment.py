from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    payment_status = Column(String, default="Pending")
    transaction_id = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
