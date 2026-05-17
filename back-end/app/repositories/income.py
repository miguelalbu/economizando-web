from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.income import Income
from app.repositories.base import BaseRepository
from app.utils.financial_cycle import get_financial_cycle_range


class IncomeRepository(BaseRepository[Income]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Income, session)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Income]:
        result = await self.session.execute(
            select(Income)
            .where(Income.user_id == user_id)
            .order_by(Income.received_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> Income | None:
        result = await self.session.execute(
            select(Income).where(Income.id == id, Income.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_financial_cycle(self, user_id: int, reference_date: date, income_day: int) -> list[Income]:
        start, end = get_financial_cycle_range(reference_date, income_day)
        result = await self.session.execute(
            select(Income)
            .where(Income.user_id == user_id, Income.received_at >= start, Income.received_at <= end)
            .order_by(Income.received_at)
        )
        return list(result.scalars().all())
