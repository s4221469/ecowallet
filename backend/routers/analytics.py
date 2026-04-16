from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict

from database import get_db
from models import Transaction

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    total_spend = sum(t.amount for t in transactions)
    total_co2 = sum(t.co2_kg or 0 for t in transactions)

    spend_by_category: dict = defaultdict(float)
    co2_by_category: dict = defaultdict(float)

    for t in transactions:
        cat = t.category or "Other"
        spend_by_category[cat] += t.amount
        co2_by_category[cat] += t.co2_kg or 0

    top_category = max(spend_by_category, key=spend_by_category.get) if spend_by_category else None

    return {
        "total_spend": round(total_spend, 2),
        "total_co2": round(total_co2, 2),
        "top_category": top_category,
        "spend_by_category": {k: round(v, 2) for k, v in spend_by_category.items()},
        "co2_by_category": {k: round(v, 2) for k, v in co2_by_category.items()},
    }


@router.get("/monthly")
def get_monthly(db: Session = Depends(get_db)):
    # Last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    transactions = (
        db.query(Transaction)
        .filter(Transaction.date >= six_months_ago)
        .all()
    )

    monthly: dict = defaultdict(float)
    for t in transactions:
        label = t.date.strftime("%Y-%m")
        monthly[label] += t.amount

    sorted_months = sorted(monthly.keys())
    return [{"month": m, "total": round(monthly[m], 2)} for m in sorted_months]
