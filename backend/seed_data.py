"""
Seed script: inserts 20 realistic transactions across 3 months.
Auto-runs on first startup if the DB is empty.
"""
from datetime import datetime, timedelta
from database import SessionLocal
from models import Transaction
from services.carbon_service import get_co2


SEED_TRANSACTIONS = [
    # 3 months ago
    {"description": "Tesco weekly shop", "amount": 62.40, "days_ago": 90, "category": "Food & Dining"},
    {"description": "British Gas electricity bill", "amount": 87.00, "days_ago": 88, "category": "Utilities"},
    {"description": "McDonald's lunch", "amount": 8.50, "days_ago": 85, "category": "Food & Dining"},
    {"description": "Uber ride to airport", "amount": 34.20, "days_ago": 83, "category": "Transport"},
    {"description": "Netflix subscription", "amount": 15.99, "days_ago": 82, "category": "Entertainment"},
    {"description": "ASOS clothing order", "amount": 75.00, "days_ago": 80, "category": "Shopping"},
    {"description": "EasyJet flight to Barcelona", "amount": 142.00, "days_ago": 78, "category": "Travel"},
    # 2 months ago
    {"description": "Sainsbury's groceries", "amount": 54.30, "days_ago": 60, "category": "Food & Dining"},
    {"description": "TfL monthly travel card", "amount": 165.20, "days_ago": 58, "category": "Transport"},
    {"description": "Boots pharmacy", "amount": 22.50, "days_ago": 55, "category": "Healthcare"},
    {"description": "Amazon Prime purchase", "amount": 47.99, "days_ago": 53, "category": "Shopping"},
    {"description": "Odeon cinema tickets", "amount": 24.00, "days_ago": 50, "category": "Entertainment"},
    {"description": "Water bill", "amount": 35.00, "days_ago": 48, "category": "Utilities"},
    {"description": "Nando's dinner", "amount": 31.60, "days_ago": 45, "category": "Food & Dining"},
    # 1 month ago
    {"description": "Waitrose weekend shop", "amount": 89.10, "days_ago": 28, "category": "Food & Dining"},
    {"description": "Shell petrol station", "amount": 65.00, "days_ago": 26, "category": "Transport"},
    {"description": "Spotify Premium", "amount": 10.99, "days_ago": 24, "category": "Entertainment"},
    {"description": "Primark shopping", "amount": 58.00, "days_ago": 22, "category": "Shopping"},
    {"description": "GP prescription fee", "amount": 9.90, "days_ago": 20, "category": "Healthcare"},
    {"description": "Ryanair flight to Dublin", "amount": 98.00, "days_ago": 15, "category": "Travel"},
]


def run_seed(db):
    count = db.query(Transaction).count()
    if count > 0:
        return  # DB already has data — skip seeding

    now = datetime.utcnow()
    for item in SEED_TRANSACTIONS:
        tx_date = now - timedelta(days=item["days_ago"])
        co2 = get_co2(item["category"], item["amount"])
        tx = Transaction(
            description=item["description"],
            amount=item["amount"],
            category=item["category"],
            date=tx_date,
            co2_kg=co2,
        )
        db.add(tx)

    db.commit()
    print(f"[seed] Inserted {len(SEED_TRANSACTIONS)} seed transactions.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
