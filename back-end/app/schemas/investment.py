from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.models.investment import InvestmentType
from app.models.investment_transaction import TransactionType


class InvestmentTransactionCreate(BaseModel):
    type:             TransactionType
    amount:           Decimal = Field(gt=0, decimal_places=2)
    transaction_date: date
    notes:            str | None = None


class InvestmentTransactionResponse(BaseModel):
    id:               int
    type:             TransactionType
    amount:           Decimal
    transaction_date: date
    notes:            str | None
    created_at:       datetime

    model_config = {"from_attributes": True}


class InvestmentCreate(BaseModel):
    name:          str = Field(min_length=1, max_length=255)
    type:          InvestmentType
    current_value: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    maturity_date: date | None = None
    institution:   str | None = Field(default=None, max_length=100)
    notes:         str | None = None


class InvestmentUpdate(BaseModel):
    name:          str | None = Field(default=None, min_length=1, max_length=255)
    current_value: Decimal | None = Field(default=None, ge=0, decimal_places=2)
    maturity_date: date | None = None
    institution:   str | None = Field(default=None, max_length=100)
    notes:         str | None = None


class InvestmentResponse(BaseModel):
    id:            int
    user_id:       int
    name:          str
    type:          InvestmentType
    current_value: Decimal | None
    maturity_date: date | None
    institution:   str | None
    notes:         str | None
    created_at:    datetime

    transactions:    list[InvestmentTransactionResponse] = []
    total_deposited: Decimal = Decimal("0")
    total_withdrawn: Decimal = Decimal("0")
    net_invested:    Decimal = Decimal("0")

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def compute_totals(self) -> "InvestmentResponse":
        deposited  = sum(t.amount for t in self.transactions if t.type == TransactionType.DEPOSIT)
        withdrawn  = sum(t.amount for t in self.transactions if t.type == TransactionType.WITHDRAWAL)
        self.total_deposited = Decimal(str(deposited))
        self.total_withdrawn = Decimal(str(withdrawn))
        self.net_invested    = Decimal(str(deposited - withdrawn))
        return self
