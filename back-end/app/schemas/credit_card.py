from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class CreditCardCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    last_four_digits: str | None = Field(default=None, min_length=4, max_length=4, pattern=r"^\d{4}$")
    credit_limit: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    closing_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)


class CreditCardUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    credit_limit: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    closing_day: int | None = Field(default=None, ge=1, le=31)
    due_day: int | None = Field(default=None, ge=1, le=31)


class CreditCardResponse(BaseModel):
    id: int
    user_id: int
    name: str
    last_four_digits: str | None
    credit_limit: Decimal | None
    closing_day: int
    due_day: int
    created_at: datetime

    model_config = {"from_attributes": True}
