from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit_card import CreditCard
from app.repositories.base import BaseRepository


class CreditCardRepository(BaseRepository[CreditCard]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(CreditCard, session)

    async def get_by_user(self, user_id: int) -> list[CreditCard]:
        result = await self.session.execute(
            select(CreditCard).where(CreditCard.user_id == user_id).order_by(CreditCard.name)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> CreditCard | None:
        result = await self.session.execute(
            select(CreditCard).where(CreditCard.id == id, CreditCard.user_id == user_id)
        )
        return result.scalar_one_or_none()
