import enum
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class InvestmentType(str, enum.Enum):
    FIXED_INCOME = "fixed_income"     # Renda Fixa (CDB, LCI, LCA, Tesouro)
    VARIABLE_INCOME = "variable_income"  # Renda Variável (Ações, FIIs)
    CRYPTO = "crypto"
    SAVINGS = "savings"               # Poupança
    PENSION = "pension"               # Previdência
    OTHER = "other"


class Investment(Base, TimestampMixin):
    __tablename__ = "investments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[InvestmentType] = mapped_column(Enum(InvestmentType), nullable=False)
    amount_invested: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    current_value: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    invested_at: Mapped[date] = mapped_column(Date, nullable=False)
    maturity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    institution: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Banco/Corretora
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relacionamento
    user: Mapped["User"] = relationship(back_populates="investments")

    def __repr__(self) -> str:
        return f"<Investment id={self.id} name={self.name} amount={self.amount_invested}>"
