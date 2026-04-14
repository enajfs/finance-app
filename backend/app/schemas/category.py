from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from app.models.category import CategoryType

class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    icon: str = "💸"

class CategoryUpdate(BaseModel):
    name: str | None = None
    type: CategoryType | None = None
    icon: str | None = None

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    type: CategoryType
    icon: str | None
    created_at: datetime
