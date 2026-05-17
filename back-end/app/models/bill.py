import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class BillStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class BillRecurrence(str, enum.Enum):
    ONCE = "once"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Bill(Base, TimestampMixin):
    """Boletos/Contas a pagar."""

    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[BillStatus] = mapped_column(
        Enum(BillStatus), default=BillStatus.PENDING, nullable=False
    )
    recurrence: Mapped[BillRecurrence] = mapped_column(
        Enum(BillRecurrence), default=BillRecurrence.ONCE, nullable=False
    )
    is_essential: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relacionamento
    user: Mapped["User"] = relationship(back_populates="bills")

    def __repr__(self) -> str:
        return f"<Bill id={self.id} description={self.description} due_date={self.due_date}>"
