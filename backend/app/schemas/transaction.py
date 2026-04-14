from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from datetime import date as date_type
from uuid import UUID
from app.models.transaction import TransactionType

class TransactionCreate(BaseModel):
    wallet_id: UUID
    category_id: UUID
    amount: Decimal
    type: TransactionType
    note: str | None = None
    date: date_type

class TransactionUpdate(BaseModel):
    wallet_id: UUID | None = None
    category_id: UUID | None = None
    amount: Decimal | None = None
    type: TransactionType | None = None
    note: str | None = None
    date: date_type | None = None

class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    wallet_id: UUID
    category_id: UUID
    amount: Decimal
    type: TransactionType
    note: str | None
    date: date_type
    created_at: datetime