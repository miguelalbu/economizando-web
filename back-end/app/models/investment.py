import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class InvestmentType(str, enum.Enum):
    FIXED_INCOME    = "fixed_income"
    VARIABLE_INCOME = "variable_income"
    CRYPTO          = "crypto"
    SAVINGS         = "savings"
    PENSION         = "pension"
    OTHER           = "other"


class Investment(Base, TimestampMixin):
    """Posição de investimento. Os valores são calculados a partir das transações."""

    __tablename__ = "investments"

    id:            Mapped[int]            = mapped_column(primary_key=True, index=True)
    user_id:       Mapped[int]            = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name:          Mapped[str]            = mapped_column(String(255), nullable=False)
    type:          Mapped[InvestmentType] = mapped_column(Enum(InvestmentType), nullable=False)
    current_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    maturity_date: Mapped[date | None]    = mapped_column(Date, nullable=True)
    institution:   Mapped[str | None]     = mapped_column(String(100), nullable=True)
    notes:         Mapped[str | None]     = mapped_column(Text, nullable=True)

    user:         Mapped["User"]                       = relationship(back_populates="investments")
    transactions: Mapped[list["InvestmentTransaction"]] = relationship(
        back_populates="investment",
        cascade="all, delete-orphan",
        order_by="InvestmentTransaction.transaction_date.desc()",
    )

    def __repr__(self) -> str:
        return f"<Investment id={self.id} name={self.name}>"
