from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from datetime import datetime, date
from uuid import UUID

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: Decimal
    current_amount: Decimal = Decimal("0")
    currency: str = "PHP"
    deadline: date | None = None

class SavingsGoalUpdate(BaseModel):
    name: str | None = None
    target_amount: Decimal | None = None
    current_amount: Decimal | None = None
    currency: str | None = None
    deadline: date | None = None

class SavingsGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    target_amount: Decimal
    current_amount: Decimal
    currency: str
    deadline: date | None
    created_at: datetime
