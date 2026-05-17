from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.repositories.base import BaseRepository
from app.utils.financial_cycle import get_financial_cycle_range


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Expense, session)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Expense]:
        result = await self.session.execute(
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.spent_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> Expense | None:
        result = await self.session.execute(
            select(Expense).where(Expense.id == id, Expense.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_financial_cycle(self, user_id: int, reference_date: date, income_day: int) -> list[Expense]:
        start, end = get_financial_cycle_range(reference_date, income_day)
        result = await self.session.execute(
            select(Expense)
            .where(Expense.user_id == user_id, Expense.spent_at >= start, Expense.spent_at <= end)
            .order_by(Expense.spent_at)
        )
        return list(result.scalars().all())
