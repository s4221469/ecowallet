from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    description: str
    amount: float
    date: Optional[datetime] = None


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None


class TransactionResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: Optional[str]
    date: datetime
    co2_kg: Optional[float]

    model_config = {"from_attributes": True}


class PredictionResponse(BaseModel):
    id: int
    month: str
    predicted_amount: float
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionResult(BaseModel):
    predicted_amount: float
    model: str
    months_used: int
    month: str
