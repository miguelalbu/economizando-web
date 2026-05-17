from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.income import Income
from app.repositories.income import IncomeRepository
from app.schemas.income import IncomeCreate, IncomeUpdate


class IncomeService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = IncomeRepository(session)

    async def create(self, user_id: int, data: IncomeCreate) -> Income:
        income = Income(user_id=user_id, **data.model_dump())
        return await self.repo.create(income)

    async def get_all(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Income]:
        return await self.repo.get_by_user(user_id, skip, limit)

    async def get_by_id(self, income_id: int, user_id: int) -> Income:
        income = await self.repo.get_by_id_and_user(income_id, user_id)
        if not income:
            raise NotFoundError("Ganho não encontrado.")
        return income

    async def update(self, income_id: int, user_id: int, data: IncomeUpdate) -> Income:
        income = await self.get_by_id(income_id, user_id)
        return await self.repo.update(income, data.model_dump(exclude_none=True))

    async def delete(self, income_id: int, user_id: int) -> None:
        income = await self.get_by_id(income_id, user_id)
        await self.repo.delete(income)
