from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Transaction
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from services.groq_service import categorise_transaction
from services.carbon_service import get_co2

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("", response_model=TransactionResponse)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    category = categorise_transaction(payload.description, payload.amount)
    co2 = get_co2(category, payload.amount)

    tx = Transaction(
        description=payload.description,
        amount=payload.amount,
        category=category,
        date=payload.date or datetime.utcnow(),
        co2_kg=co2,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("", response_model=list[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.date.desc()).all()


@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(tx_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if payload.description is not None:
        tx.description = payload.description
    if payload.amount is not None:
        tx.amount = payload.amount

    # Re-categorise with updated values
    category = categorise_transaction(tx.description, tx.amount)
    tx.category = category
    tx.co2_kg = get_co2(category, tx.amount)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}")
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"detail": "deleted"}
