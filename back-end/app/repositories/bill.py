from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bill import Bill, BillStatus
from app.repositories.base import BaseRepository


class BillRepository(BaseRepository[Bill]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Bill, session)

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Bill]:
        result = await self.session.execute(
            select(Bill)
            .where(Bill.user_id == user_id)
            .order_by(Bill.due_date.asc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id_and_user(self, id: int, user_id: int) -> Bill | None:
        result = await self.session.execute(
            select(Bill).where(Bill.id == id, Bill.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_pending_by_user(self, user_id: int) -> list[Bill]:
        result = await self.session.execute(
            select(Bill)
            .where(Bill.user_id == user_id, Bill.status == BillStatus.PENDING)
            .order_by(Bill.due_date.asc())
        )
        return list(result.scalars().all())
