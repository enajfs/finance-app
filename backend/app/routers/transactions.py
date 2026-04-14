from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import date
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("", response_model=list[TransactionOut])
async def list_transactions(
    wallet_id: UUID | None = Query(None),
    category_id: UUID | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Join through wallet to scope by user
    stmt = (
        select(Transaction)
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(Wallet.user_id == user.id)
    )
    if wallet_id:
        stmt = stmt.where(Transaction.wallet_id == wallet_id)
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if from_date:
        stmt = stmt.where(Transaction.date >= from_date)
    if to_date:
        stmt = stmt.where(Transaction.date <= to_date)
    stmt = stmt.order_by(Transaction.date.desc(), Transaction.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=TransactionOut, status_code=201)
async def create_transaction(body: TransactionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Verify wallet belongs to user
    result = await db.execute(select(Wallet).where(Wallet.id == body.wallet_id, Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Update wallet balance
    if body.type == "income":
        wallet.balance += body.amount
    else:
        wallet.balance -= body.amount

    tx = Transaction(**body.model_dump())
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.put("/{tx_id}", response_model=TransactionOut)
async def update_transaction(tx_id: UUID, body: TransactionUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Transaction)
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(Transaction.id == tx_id, Wallet.user_id == user.id)
    )
    result = await db.execute(stmt)
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    await db.commit()
    await db.refresh(tx)
    return tx

@router.delete("/{tx_id}", status_code=204)
async def delete_transaction(tx_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Transaction)
        .join(Wallet, Transaction.wallet_id == Wallet.id)
        .where(Transaction.id == tx_id, Wallet.user_id == user.id)
    )
    result = await db.execute(stmt)
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.delete(tx)
    await db.commit()
