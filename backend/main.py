from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from database import engine, SessionLocal, Base
from models import Transaction, Prediction  # noqa: F401 — ensure tables are registered
from routers import transactions, analytics, predictions
from seed_data import run_seed

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoWallet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(predictions.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
