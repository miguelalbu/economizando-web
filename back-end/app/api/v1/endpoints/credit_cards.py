from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.credit_card import CreditCardCreate, CreditCardResponse, CreditCardUpdate
from app.services.credit_card import CreditCardService

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])


@router.post("", response_model=CreditCardResponse, status_code=201)
async def create_credit_card(
    data: CreditCardCreate, current_user: CurrentUser, session: DBSession
) -> CreditCardResponse:
    service = CreditCardService(session)
    card = await service.create(current_user.id, data)
    return CreditCardResponse.model_validate(card)


@router.get("", response_model=list[CreditCardResponse])
async def list_credit_cards(current_user: CurrentUser, session: DBSession) -> list[CreditCardResponse]:
    service = CreditCardService(session)
    cards = await service.get_all(current_user.id)
    return [CreditCardResponse.model_validate(c) for c in cards]


@router.get("/{card_id}", response_model=CreditCardResponse)
async def get_credit_card(card_id: int, current_user: CurrentUser, session: DBSession) -> CreditCardResponse:
    service = CreditCardService(session)
    card = await service.get_by_id(card_id, current_user.id)
    return CreditCardResponse.model_validate(card)


@router.patch("/{card_id}", response_model=CreditCardResponse)
async def update_credit_card(
    card_id: int, data: CreditCardUpdate, current_user: CurrentUser, session: DBSession
) -> CreditCardResponse:
    service = CreditCardService(session)
    card = await service.update(card_id, current_user.id, data)
    return CreditCardResponse.model_validate(card)


@router.delete("/{card_id}", status_code=204)
async def delete_credit_card(card_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = CreditCardService(session)
    await service.delete(card_id, current_user.id)
