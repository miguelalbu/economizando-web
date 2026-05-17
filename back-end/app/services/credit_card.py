from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.credit_card import CreditCard
from app.repositories.credit_card import CreditCardRepository
from app.schemas.credit_card import CreditCardCreate, CreditCardUpdate


class CreditCardService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = CreditCardRepository(session)

    async def create(self, user_id: int, data: CreditCardCreate) -> CreditCard:
        card = CreditCard(user_id=user_id, **data.model_dump())
        return await self.repo.create(card)

    async def get_all(self, user_id: int) -> list[CreditCard]:
        return await self.repo.get_by_user(user_id)

    async def get_by_id(self, card_id: int, user_id: int) -> CreditCard:
        card = await self.repo.get_by_id_and_user(card_id, user_id)
        if not card:
            raise NotFoundError("Cartão de crédito não encontrado.")
        return card

    async def update(self, card_id: int, user_id: int, data: CreditCardUpdate) -> CreditCard:
        card = await self.get_by_id(card_id, user_id)
        return await self.repo.update(card, data.model_dump(exclude_none=True))

    async def delete(self, card_id: int, user_id: int) -> None:
        card = await self.get_by_id(card_id, user_id)
        await self.repo.delete(card)
