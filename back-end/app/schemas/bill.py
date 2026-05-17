from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.bill import BillRecurrence, BillStatus


class BillCreate(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, decimal_places=2)
    due_date: date
    recurrence: BillRecurrence = BillRecurrence.ONCE
    is_essential: bool = False
    notes: str | None = None
    barcode: str | None = Field(default=None, max_length=100)


class BillUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    due_date: date | None = None
    paid_at: date | None = None
    status: BillStatus | None = None
    notes: str | None = None


class BillResponse(BaseModel):
    id: int
    user_id: int
    description: str
    amount: Decimal
    due_date: date
    paid_at: date | None
    status: BillStatus
    recurrence: BillRecurrence
    is_essential: bool
    notes: str | None
    barcode: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
