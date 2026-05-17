from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.expense import Expense
from app.repositories.expense import ExpenseRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = ExpenseRepository(session)

    async def create(self, user_id: int, data: ExpenseCreate) -> Expense:
        expense = Expense(user_id=user_id, **data.model_dump())
        return await self.repo.create(expense)

    async def get_all(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Expense]:
        return await self.repo.get_by_user(user_id, skip, limit)

    async def get_by_id(self, expense_id: int, user_id: int) -> Expense:
        expense = await self.repo.get_by_id_and_user(expense_id, user_id)
        if not expense:
            raise NotFoundError("Gasto não encontrado.")
        return expense

    async def update(self, expense_id: int, user_id: int, data: ExpenseUpdate) -> Expense:
        expense = await self.get_by_id(expense_id, user_id)
        return await self.repo.update(expense, data.model_dump(exclude_none=True))

    async def delete(self, expense_id: int, user_id: int) -> None:
        expense = await self.get_by_id(expense_id, user_id)
        await self.repo.delete(expense)
