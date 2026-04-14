from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date, timedelta
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.dashboard import MonthlySummary, CategorySpend, BalancePoint
from decimal import Decimal

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=MonthlySummary)
async def get_summary(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    stmt = (
        select(Transaction.type, func.sum(Transaction.amount).label("total"))
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(Wallet.user_id == user.id, Transaction.date >= first_day, Transaction.date <= last_day)
        .group_by(Transaction.type)
    )
    result = await db.execute(stmt)
    rows = result.all()
    totals = {row.type: row.total or Decimal("0") for row in rows}
    income = totals.get(TransactionType.income, Decimal("0"))
    expense = totals.get(TransactionType.expense, Decimal("0"))
    return MonthlySummary(total_income=income, total_expense=expense, net=income - expense)

@router.get("/by-category", response_model=list[CategorySpend])
async def get_by_category(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)

    stmt = (
        select(Category.id, Category.name, Category.icon, func.sum(Transaction.amount).label("total"))
        .join(Transaction, Transaction.category_id == Category.id)
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(
            Wallet.user_id == user.id,
            Transaction.type == TransactionType.expense,
            Transaction.date >= first_day,
            Transaction.date <= last_day,
        )
        .group_by(Category.id, Category.name, Category.icon)
        .order_by(func.sum(Transaction.amount).desc())
    )
    result = await db.execute(stmt)
    return [
        CategorySpend(category_id=str(row.id), category_name=row.name, icon=row.icon, total=row.total)
        for row in result.all()
    ]

@router.get("/balance-history", response_model=list[BalancePoint])
async def get_balance_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wallets_result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    wallets = wallets_result.scalars().all()
    points = []
    today = date.today()
    for wallet in wallets:
        for i in range(5, -1, -1):
            d = date(today.year, today.month, 1) - timedelta(days=i * 30)
            stmt = (
                select(func.sum(Transaction.amount).filter(Transaction.type == TransactionType.income) -
                       func.sum(Transaction.amount).filter(Transaction.type == TransactionType.expense))
                .where(Transaction.wallet_id == wallet.id, Transaction.date <= d)
            )
            result = await db.execute(stmt)
            balance = result.scalar() or Decimal("0")
            points.append(BalancePoint(date=d.strftime("%b %Y"), balance=balance + wallet.balance, wallet_id=str(wallet.id), wallet_name=wallet.name))
    return points
