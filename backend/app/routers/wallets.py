from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.wallet import WalletCreate, WalletUpdate, WalletOut

router = APIRouter(prefix="/api/wallets", tags=["wallets"])

@router.get("", response_model=list[WalletOut])
async def list_wallets(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
    return result.scalars().all()

@router.post("", response_model=WalletOut, status_code=201)
async def create_wallet(body: WalletCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wallet = Wallet(user_id=user.id, **body.model_dump())
    db.add(wallet)
    await db.commit()
    await db.refresh(wallet)
    return wallet

@router.put("/{wallet_id}", response_model=WalletOut)
async def update_wallet(wallet_id: UUID, body: WalletUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(wallet, field, value)
    await db.commit()
    await db.refresh(wallet)
    return wallet

@router.delete("/{wallet_id}", status_code=204)
async def delete_wallet(wallet_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user.id))
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    await db.delete(wallet)
    await db.commit()
