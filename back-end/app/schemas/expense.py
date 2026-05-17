from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator

from app.models.expense import ExpenseCategory, PaymentMethod


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=255)
    amount: Decimal = Field(gt=0, decimal_places=2)
    spent_at: date
    payment_method: PaymentMethod
    category: ExpenseCategory = ExpenseCategory.OTHER
    credit_card_id: int | None = None
    installments: int = Field(default=1, ge=1, le=60)
    notes: str | None = None

    @model_validator(mode="after")
    def validate_credit_card_for_payment_method(self) -> "ExpenseCreate":
        if self.payment_method == PaymentMethod.CREDIT_CARD and not self.credit_card_id:
            raise ValueError("credit_card_id é obrigatório para pagamentos com cartão de crédito.")
        if self.payment_method != PaymentMethod.CREDIT_CARD and self.credit_card_id:
            raise ValueError("credit_card_id só pode ser informado para pagamentos com cartão de crédito.")
        return self


class ExpenseUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, gt=0, decimal_places=2)
    spent_at: date | None = None
    category: ExpenseCategory | None = None
    notes: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    credit_card_id: int | None
    description: str
    amount: Decimal
    spent_at: date
    payment_method: PaymentMethod
    category: ExpenseCategory
    installments: int
    installment_number: int
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
