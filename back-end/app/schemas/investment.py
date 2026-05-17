from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.investment import InvestmentType


class InvestmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: InvestmentType
    amount_invested: Decimal = Field(gt=0, decimal_places=2)
    current_value: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    invested_at: date
    maturity_date: date | None = None
    institution: str | None = Field(default=None, max_length=100)
    notes: str | None = None


class InvestmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    current_value: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    maturity_date: date | None = None
    notes: str | None = None


class InvestmentResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: InvestmentType
    amount_invested: Decimal
    current_value: Decimal | None
    invested_at: date
    maturity_date: date | None
    institution: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
