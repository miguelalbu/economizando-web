from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Income(Base, TimestampMixin):
    """Ganhos/Recebimentos do usuário.

    A data de recebimento (received_at) define o início do ciclo financeiro mensal.
    Ex: se received_at = dia 15, o "mês financeiro" começa no dia 15 de cada mês.
    """

    __tablename__ = "incomes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    received_at: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relacionamento
    user: Mapped["User"] = relationship(back_populates="incomes")

    def __repr__(self) -> str:
        return f"<Income id={self.id} amount={self.amount} received_at={self.received_at}>"
