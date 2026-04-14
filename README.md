# Finance App

Personal budgeting and expense tracker — FastAPI + React + Vite + TypeScript + Clerk + PostgreSQL.

---

## Project Structure

```
finance-app/
├── backend/      # FastAPI + SQLAlchemy + Alembic
└── frontend/     # React + Vite + TypeScript + Clerk
```

---

## Prerequisites

- Python 3.11+ (avoid 3.14 until asyncpg catches up — using psycopg3 here so you're fine)
- Node.js 18+
- PostgreSQL 18 running locally
- A [Clerk](https://clerk.com) account (free tier works)

---

## 1 — Database Setup

```sql
-- In psql or pgAdmin:
CREATE DATABASE financedb;
```

---

## 2 — Backend Setup

```bash
cd backend

# Copy and fill in your env
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql+psycopg://postgres:yourpassword@localhost:5432/financedb
#   CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run first migration (creates all tables)
alembic revision --autogenerate -m "initial"
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 8000
```

API will be available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

---

## 3 — Clerk Setup

1. Go to [clerk.com](https://clerk.com) → create a new application
2. In your Clerk dashboard → **API Keys** → copy the **Publishable Key**
3. In **JWT Templates** (or the JWKS endpoint): copy your JWKS URL  
   It looks like: `https://your-app.clerk.accounts.dev/.well-known/jwks.json`
4. Paste the JWKS URL into `backend/.env` as `CLERK_JWKS_URL`

---

## 4 — Frontend Setup

```bash
cd frontend

# Copy and fill in your env
cp .env.example .env
# Edit .env:
#   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
#   VITE_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be at: http://localhost:5173

---

## Pages

| Page | Route (nav) | Features |
|---|---|---|
| Dashboard | Home | Balance hero, wallet cards, charts, recent transactions |
| Wallets | Wallets | List, add, edit, delete wallets |
| Transactions | Txns | List with filters, add, edit, delete |
| Goals | Goals | Progress bars, add funds, add, edit, delete |
| Categories | (via Settings nav or add directly) | List, add, edit, delete |
| Settings | Settings | Theme switcher, account info |

---

## Color Themes

Switch in the Settings page. Theme is saved to `localStorage` and persists across sessions.

| Theme | Primary |
|---|---|
| Ocean Blue (default) | `#2563EB` |
| Forest Green | `#16A34A` |
| Royal Purple | `#7C3AED` |
| Sunset Orange | `#EA580C` |
| Rose Pink | `#E11D48` |

---

## Known Gotchas (from blueprint)

- **psycopg3** is used instead of asyncpg to avoid Python 3.14 compatibility issues
- **CORS** middleware is registered before all routers in `main.py`
- **Decimal** amounts use `Numeric(18,2)` in SQLAlchemy; Pydantic handles serialization
- **All API routes** are under `/api/` prefix — the React catch-all never intercepts them
- **Bottom nav** has `pb-24` equivalent padding on all page content
- **Theme** is applied before first render via `localStorage` in `ThemeContext`
