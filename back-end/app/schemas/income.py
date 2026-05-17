from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class IncomeCreate(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, decimal_places=2)
    received_at: date
    notes: str | None = None


class IncomeUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    received_at: date | None = None
    notes: str | None = None


class IncomeResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount: Decimal
    received_at: date
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
