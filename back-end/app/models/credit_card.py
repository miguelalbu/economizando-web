from decimal import Decimal

from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class CreditCard(Base, TimestampMixin):
    __tablename__ = "credit_cards"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_four_digits: Mapped[str | None] = mapped_column(String(4), nullable=True)
    credit_limit: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    closing_day: Mapped[int] = mapped_column(Integer, nullable=False)  # Dia de fechamento da fatura
    due_day: Mapped[int] = mapped_column(Integer, nullable=False)       # Dia de vencimento da fatura

    # Relacionamento
    user: Mapped["User"] = relationship(back_populates="credit_cards")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="credit_card", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<CreditCard id={self.id} name={self.name}>"
