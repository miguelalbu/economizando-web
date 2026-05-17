import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class TransactionType(str, enum.Enum):
    DEPOSIT    = "deposit"
    WITHDRAWAL = "withdrawal"


class InvestmentTransaction(Base, TimestampMixin):
    """Histórico de depósitos e saques de um investimento."""

    __tablename__ = "investment_transactions"

    id:            Mapped[int]              = mapped_column(primary_key=True, index=True)
    investment_id: Mapped[int]              = mapped_column(ForeignKey("investments.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id:       Mapped[int]              = mapped_column(ForeignKey("users.id",        ondelete="CASCADE"), nullable=False, index=True)
    type:          Mapped[TransactionType]  = mapped_column(Enum(TransactionType, name="investment_transaction_type"), nullable=False)
    amount:        Mapped[Decimal]          = mapped_column(Numeric(12, 2), nullable=False)
    transaction_date: Mapped[date]          = mapped_column(Date, nullable=False)
    notes:         Mapped[str | None]       = mapped_column(Text, nullable=True)

    investment: Mapped["Investment"]         = relationship(back_populates="transactions")

    def __repr__(self) -> str:
        return f"<InvestmentTransaction id={self.id} type={self.type} amount={self.amount}>"
