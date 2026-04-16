from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Transaction, Prediction
from schemas import PredictionResponse
from services.ml_service import train_and_predict, get_next_month_label

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.post("/generate")
def generate_prediction(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    result = train_and_predict(transactions)
    month_label = get_next_month_label()

    prediction = Prediction(
        month=month_label,
        predicted_amount=result["predicted_amount"],
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return {
        "id": prediction.id,
        "month": prediction.month,
        "predicted_amount": prediction.predicted_amount,
        "created_at": prediction.created_at,
        "model": result["model"],
        "months_used": result["months_used"],
    }


@router.get("/latest")
def get_latest_prediction(db: Session = Depends(get_db)):
    prediction = (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    if not prediction:
        return None
    return {
        "id": prediction.id,
        "month": prediction.month,
        "predicted_amount": prediction.predicted_amount,
        "created_at": prediction.created_at,
    }
