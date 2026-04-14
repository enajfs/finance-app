from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime
from uuid import UUID

class WalletCreate(BaseModel):
    name: str
    currency: str = "PHP"
    balance: Decimal = Decimal("0")

class WalletUpdate(BaseModel):
    name: str | None = None
    currency: str | None = None
    balance: Decimal | None = None

class WalletOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    currency: str
    balance: Decimal
    created_at: datetime
