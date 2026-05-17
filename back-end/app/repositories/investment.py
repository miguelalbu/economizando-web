from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.investment import Investment
from app.models.investment_transaction import InvestmentTransaction
from app.repositories.base import BaseRepository


class InvestmentRepository(BaseRepository[Investment]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Investment, session)

    async def get_by_user(self, user_id: int) -> list[Investment]:
        result = await self.session.execute(
            select(Investment)
            .where(Investment.user_id == user_id)
            .options(selectinload(Investment.transactions))
            .order_by(Investment.name)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> Investment | None:
        result = await self.session.execute(
            select(Investment)
            .where(Investment.id == id, Investment.user_id == user_id)
            .options(selectinload(Investment.transactions))
        )
        return result.scalar_one_or_none()

    async def get_transaction(self, tx_id: int, investment_id: int, user_id: int) -> InvestmentTransaction | None:
        result = await self.session.execute(
            select(InvestmentTransaction).where(
                InvestmentTransaction.id == tx_id,
                InvestmentTransaction.investment_id == investment_id,
                InvestmentTransaction.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()
