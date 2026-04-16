# 🌿 EcoWallet

![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Groq](https://img.shields.io/badge/Groq-LLaMA3-F55036)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-F7931E?logo=scikit-learn)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

**EcoWallet** is an AI-powered personal finance tracker that automatically categorises expenses using Groq LLaMA3, predicts next month's spending with a scikit-learn ML model, and calculates the carbon footprint of every spending category.

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A free **Groq API key** → get one at [console.groq.com](https://console.groq.com)

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd ecowallet

# 2. Create your .env file from the template
cp .env.example .env

# 3. Add your Groq API key to .env
#    GROQ_API_KEY=gsk_...

# 4. Build and run everything
docker compose up --build

# 5. Open the app
open http://localhost:3000
```

> On first startup the database is empty — 20 realistic seed transactions are automatically inserted across 3 months so the ML model has enough history to train immediately.

---

## Features

- **AI Categorisation** — every transaction is classified by Groq LLaMA3-8b into one of 8 categories (Food & Dining, Transport, Shopping, Entertainment, Utilities, Healthcare, Travel, Other)
- **Carbon Footprint** — each transaction gets a CO₂ estimate in kg based on UK average data
- **ML Spending Prediction** — click "Generate Prediction" to train a LinearRegression model on your own data and forecast next month's spend; falls back to a simple average if fewer than 2 months of history exist
- **Interactive Dashboard** — doughnut chart of spend by category, bar chart of CO₂ by category, summary cards
- **Persistent Data** — SQLite stored in a Docker volume; your data survives restarts
- **Full CRUD** — add, view, and delete transactions
- **Zero Manual Setup** — one command: `docker compose up --build`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│                   http://localhost:3000                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              frontend container (Nginx :80)                   │
│  React 18 + Vite + Tailwind CSS + Recharts                   │
│                                                               │
│  /              → serves React SPA (index.html)              │
│  /api/*         → proxy to backend:8000                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP proxy
┌──────────────────────────▼──────────────────────────────────┐
│              backend container (FastAPI :8000)                │
│                                                               │
│  POST /transactions      → Groq AI categorise + CO₂ calc    │
│  GET  /transactions      → list all                          │
│  PUT  /transactions/:id  → re-categorise                     │
│  DELETE /transactions/:id                                    │
│  GET  /analytics/summary → totals, per-category breakdown    │
│  GET  /analytics/monthly → last 6 months                     │
│  POST /predictions/generate → train LinearRegression → save  │
│  GET  /predictions/latest                                    │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ groq_service│  │carbon_service│  │   ml_service      │  │
│  │ LLaMA3-8b   │  │ CO₂ lookup   │  │ LinearRegression  │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                                                               │
│  SQLAlchemy ORM → SQLite (Docker volume: sqlite_data)        │
└──────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────▼──────────────┐
            │   External: Groq Cloud API   │
            │   model: llama3-8b-8192      │
            └─────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Alembic |
| Database | SQLite (persisted via Docker volume) |
| AI | Groq SDK → LLaMA3-8b-8192 |
| ML | scikit-learn LinearRegression, Pandas, NumPy |
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Axios |
| Infrastructure | Docker Compose, Nginx |

---

## Screenshots

> _Add your screenshots here after running the app._

---

## Notes

- The ML model re-trains from scratch on every prediction call — this is intentional and perfectly fast at this scale.
- CO₂ values are estimates based on UK average data; they are shown as approximations only.
- More transactions = better ML predictions.
- The Groq API key is free at [console.groq.com](https://console.groq.com).
