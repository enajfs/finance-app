from pydantic import BaseModel
from decimal import Decimal

class MonthlySummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net: Decimal

class CategorySpend(BaseModel):
    category_id: str
    category_name: str
    icon: str | None
    total: Decimal

class BalancePoint(BaseModel):
    date: str
    balance: Decimal
    wallet_id: str
    wallet_name: str
