from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    co2_kg = Column(Float, nullable=True)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    month = Column(String, nullable=False)
    predicted_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
