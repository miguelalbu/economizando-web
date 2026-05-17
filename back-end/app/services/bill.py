from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.bill import Bill, BillStatus
from app.repositories.bill import BillRepository
from app.schemas.bill import BillCreate, BillUpdate


class BillService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = BillRepository(session)

    async def create(self, user_id: int, data: BillCreate) -> Bill:
        bill = Bill(user_id=user_id, **data.model_dump())
        return await self.repo.create(bill)

    async def get_all(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Bill]:
        return await self.repo.get_by_user(user_id, skip, limit)

    async def get_by_id(self, bill_id: int, user_id: int) -> Bill:
        bill = await self.repo.get_by_id_and_user(bill_id, user_id)
        if not bill:
            raise NotFoundError("Boleto não encontrado.")
        return bill

    async def update(self, bill_id: int, user_id: int, data: BillUpdate) -> Bill:
        bill = await self.get_by_id(bill_id, user_id)
        return await self.repo.update(bill, data.model_dump(exclude_none=True))

    async def mark_as_paid(self, bill_id: int, user_id: int) -> Bill:
        bill = await self.get_by_id(bill_id, user_id)
        bill.status = BillStatus.PAID
        bill.paid_at = date.today()
        await self.repo.session.flush()
        await self.repo.session.refresh(bill)
        return bill

    async def delete(self, bill_id: int, user_id: int) -> None:
        bill = await self.get_by_id(bill_id, user_id)
        await self.repo.delete(bill)
