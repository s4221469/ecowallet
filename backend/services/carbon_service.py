CO2_PER_GBP = {
    "Food & Dining": 0.5,
    "Transport": 1.2,
    "Shopping": 0.4,
    "Entertainment": 0.2,
    "Utilities": 0.8,
    "Healthcare": 0.1,
    "Travel": 2.5,
    "Education": 0.1,
    "Other": 0.3,
}


def get_co2(category: str, amount: float) -> float:
    rate = CO2_PER_GBP.get(category, CO2_PER_GBP["Other"])
    return round(amount * rate, 2)
