from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.investment import Investment, InvestmentType
from app.repositories.base import BaseRepository


class InvestmentRepository(BaseRepository[Investment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Investment, session)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Investment]:
        result = await self.session.execute(
            select(Investment)
            .where(Investment.user_id == user_id)
            .order_by(Investment.invested_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> Investment | None:
        result = await self.session.execute(
            select(Investment).where(Investment.id == id, Investment.user_id == user_id)
        )
        return result.scalar_one_or_none()
