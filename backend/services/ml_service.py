from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def train_and_predict(transactions: list) -> dict:
    if not transactions:
        return {
            "predicted_amount": 0.0,
            "model": "average",
            "months_used": 0,
        }

    df = pd.DataFrame(
        [{"amount": t.amount, "date": t.date} for t in transactions]
    )
    df["date"] = pd.to_datetime(df["date"])
    df["month"] = df["date"].dt.to_period("M")

    monthly = df.groupby("month")["amount"].sum().reset_index()
    monthly = monthly.sort_values("month")

    months_used = len(monthly)

    if months_used < 2:
        predicted = float(monthly["amount"].mean())
        return {
            "predicted_amount": round(predicted, 2),
            "model": "average",
            "months_used": months_used,
        }

    X = np.arange(months_used).reshape(-1, 1)
    y = monthly["amount"].values

    model = LinearRegression()
    model.fit(X, y)

    next_index = np.array([[months_used]])
    predicted = float(model.predict(next_index)[0])
    predicted = max(0.0, predicted)

    return {
        "predicted_amount": round(predicted, 2),
        "model": "linear_regression",
        "months_used": months_used,
    }


def get_next_month_label() -> str:
    now = datetime.utcnow()
    if now.month == 12:
        return f"{now.year + 1}-01"
    return f"{now.year}-{now.month + 1:02d}"
