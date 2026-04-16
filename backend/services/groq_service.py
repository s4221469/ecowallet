import json
import os
import re
from openai import OpenAI

VALID_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Travel",
    "Education",
    "Other",
]

# Detailed prompt with per-category examples so the model never has to guess
SYSTEM_PROMPT = """You are a UK personal finance transaction categoriser.

Return ONLY a valid JSON object with exactly one key "category". No other text, no markdown, no explanation.

Choose the SINGLE best matching category:
- Food & Dining: restaurants, cafes, takeaways, fast food, supermarkets, groceries, pubs, bars (e.g. Tesco, McDonald's, Nando's, Starbucks, KFC, Subway, Greggs, Waitrose)
- Transport: fuel, petrol, trains, buses, taxis, Uber, Bolt, car insurance, parking, TfL, National Rail, Trainline
- Shopping: clothes, electronics, Amazon, ASOS, Primark, eBay, gifts, department stores, online retail, Argos, John Lewis, Next; also buying clothes or items FOR college/school/university (e.g. "college outfit", "school shopping", "uni haul") — IMPORTANT: "college outfit shopping" is Shopping, NOT Education
- Entertainment: Netflix, Spotify, Disney+, Amazon Prime, cinema, Odeon, Vue, concerts, gigs, events, parties, clubs, games, Steam, media subscriptions (e.g. "Netflix subscription", "party", "movie", "cinema ticket", "concert", "gig", "festival")
- Utilities: electricity, gas, water, broadband, internet, mobile phone bill, council tax, home insurance (e.g. British Gas, BT, EDF, Sky, Vodafone, O2, Three)
- Healthcare: pharmacy, GP, dentist, optician, Boots, hospital, prescription, medication, gym membership, mental health
- Travel: flights, hotels, Airbnb, holidays, holiday packages, abroad trips, foreign currency (e.g. EasyJet, Ryanair, Booking.com, Airbnb, TUI, Expedia)
- Education: tuition fees, school fees, university fees, courses, lessons, private tutoring, textbooks, Udemy, Coursera, training, revision materials, school supplies — NOT clothes or shopping items even if bought for school
- Other: anything that does not clearly fit any category above

Example outputs — return exactly this format, nothing else:
{"category": "Food & Dining"}
{"category": "Entertainment"}
{"category": "Education"}
{"category": "Other"}
"""


def categorise_transaction(description: str, amount: float) -> str:
    """Call Groq via OpenAI-compatible API to categorise a transaction. All outcomes printed to stdout for Docker logs."""
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key.strip() in ("", "your_key_here"):
        print("[groq] WARNING: GROQ_API_KEY not set — all transactions will fall back to Other", flush=True)
        return "Other"

    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        user_message = f'Categorise this UK transaction: "{description}", amount £{amount:.2f}'

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ],
            temperature=0,
            max_tokens=60,
        )

        raw = response.choices[0].message.content.strip()
        print(f'[groq] "{description}" raw response: {raw!r}', flush=True)

        # Robustly extract first {...} block — handles markdown fences and stray text
        json_match = re.search(r'\{[^}]+\}', raw)
        if not json_match:
            print(f'[groq] WARNING: no JSON found for "{description}", defaulting to Other', flush=True)
            return "Other"

        data = json.loads(json_match.group())
        category = data.get("category", "Other").strip()

        if category not in VALID_CATEGORIES:
            print(f'[groq] WARNING: unknown category "{category}" for "{description}", defaulting to Other', flush=True)
            return "Other"

        print(f'[groq] "{description}" => {category}', flush=True)
        return category

    except Exception as exc:
        # flush=True ensures this always appears in `docker compose logs backend`
        print(f'[groq] ERROR for "{description}": {type(exc).__name__}: {exc}', flush=True)
        return "Other"
