from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.investment import Investment
from app.models.investment_transaction import InvestmentTransaction
from app.repositories.investment import InvestmentRepository
from app.schemas.investment import InvestmentCreate, InvestmentTransactionCreate, InvestmentUpdate


class InvestmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = InvestmentRepository(session)
        self.session = session

    async def create(self, user_id: int, data: InvestmentCreate) -> Investment:
        investment = Investment(user_id=user_id, **data.model_dump())
        created = await self.repo.create(investment)
        return await self.repo.get_by_id_and_user(created.id, user_id)  # type: ignore

    async def get_all(self, user_id: int) -> list[Investment]:
        return await self.repo.get_by_user(user_id)

    async def get_by_id(self, investment_id: int, user_id: int) -> Investment:
        investment = await self.repo.get_by_id_and_user(investment_id, user_id)
        if not investment:
            raise NotFoundError("Investimento não encontrado.")
        return investment

    async def update(self, investment_id: int, user_id: int, data: InvestmentUpdate) -> Investment:
        investment = await self.get_by_id(investment_id, user_id)
        await self.repo.update(investment, data.model_dump(exclude_none=True))
        return await self.repo.get_by_id_and_user(investment_id, user_id)  # type: ignore

    async def delete(self, investment_id: int, user_id: int) -> None:
        investment = await self.get_by_id(investment_id, user_id)
        await self.repo.delete(investment)

    async def add_transaction(
        self, investment_id: int, user_id: int, data: InvestmentTransactionCreate
    ) -> Investment:
        investment = await self.get_by_id(investment_id, user_id)

        tx = InvestmentTransaction(
            investment_id=investment.id,
            user_id=user_id,
            **data.model_dump(),
        )
        self.session.add(tx)
        await self.session.flush()

        # Recarrega com as transações atualizadas
        return await self.repo.get_by_id_and_user(investment_id, user_id)  # type: ignore

    async def delete_transaction(self, investment_id: int, tx_id: int, user_id: int) -> Investment:
        tx = await self.repo.get_transaction(tx_id, investment_id, user_id)
        if not tx:
            raise NotFoundError("Transação não encontrada.")
        await self.session.delete(tx)
        await self.session.flush()
        return await self.repo.get_by_id_and_user(investment_id, user_id)  # type: ignore
