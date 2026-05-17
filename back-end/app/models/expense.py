import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class PaymentMethod(str, enum.Enum):
    CASH = "cash"           # Dinheiro
    PIX = "pix"
    DEBIT = "debit"         # Débito
    CREDIT_CARD = "credit_card"


class ExpenseCategory(str, enum.Enum):
    FOOD = "food"
    TRANSPORT = "transport"
    HEALTH = "health"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    CLOTHING = "clothing"
    HOME = "home"
    OTHER = "other"


class Expense(Base, TimestampMixin):
    """Gastos/Despesas do usuário."""

    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    credit_card_id: Mapped[int | None] = mapped_column(
        ForeignKey("credit_cards.id", ondelete="SET NULL"), nullable=True, index=True
    )

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    spent_at: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(
        Enum(ExpenseCategory), default=ExpenseCategory.OTHER, nullable=False
    )
    installments: Mapped[int] = mapped_column(default=1, nullable=False)        # Parcelas
    installment_number: Mapped[int] = mapped_column(default=1, nullable=False)  # Parcela atual
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relacionamentos
    user: Mapped["User"] = relationship(back_populates="expenses")
    credit_card: Mapped["CreditCard | None"] = relationship(back_populates="expenses")

    def __repr__(self) -> str:
        return f"<Expense id={self.id} description={self.description} amount={self.amount}>"
