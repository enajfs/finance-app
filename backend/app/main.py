from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import wallets, categories, transactions, savings_goals, dashboard

app = FastAPI(title="Finance App API", version="1.0.0")

# CORS must be added before routers
app.add_middleware(
    CORSMiddleware,
   allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wallets.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(savings_goals.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Finance App API"}
