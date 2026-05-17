from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.investment import Investment
from app.repositories.investment import InvestmentRepository
from app.schemas.investment import InvestmentCreate, InvestmentUpdate


class InvestmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = InvestmentRepository(session)

    async def create(self, user_id: int, data: InvestmentCreate) -> Investment:
        investment = Investment(user_id=user_id, **data.model_dump())
        return await self.repo.create(investment)

    async def get_all(self, user_id: int, skip: int = 0, limit: int = 100) -> list[Investment]:
        return await self.repo.get_by_user(user_id, skip, limit)

    async def get_by_id(self, investment_id: int, user_id: int) -> Investment:
        investment = await self.repo.get_by_id_and_user(investment_id, user_id)
        if not investment:
            raise NotFoundError("Investimento não encontrado.")
        return investment

    async def update(self, investment_id: int, user_id: int, data: InvestmentUpdate) -> Investment:
        investment = await self.get_by_id(investment_id, user_id)
        return await self.repo.update(investment, data.model_dump(exclude_none=True))

    async def delete(self, investment_id: int, user_id: int) -> None:
        investment = await self.get_by_id(investment_id, user_id)
        await self.repo.delete(investment)
