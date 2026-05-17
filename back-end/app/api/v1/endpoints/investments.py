from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.investment import (
    InvestmentCreate, InvestmentResponse, InvestmentTransactionCreate, InvestmentUpdate,
)
from app.services.investment import InvestmentService

router = APIRouter(prefix="/investments", tags=["investments"])


@router.post("", response_model=InvestmentResponse, status_code=201)
async def create_investment(data: InvestmentCreate, current_user: CurrentUser, session: DBSession) -> InvestmentResponse:
    service = InvestmentService(session)
    inv = await service.create(current_user.id, data)
    return InvestmentResponse.model_validate(inv)


@router.get("", response_model=list[InvestmentResponse])
async def list_investments(current_user: CurrentUser, session: DBSession) -> list[InvestmentResponse]:
    service = InvestmentService(session)
    items = await service.get_all(current_user.id)
    return [InvestmentResponse.model_validate(i) for i in items]


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(investment_id: int, current_user: CurrentUser, session: DBSession) -> InvestmentResponse:
    service = InvestmentService(session)
    inv = await service.get_by_id(investment_id, current_user.id)
    return InvestmentResponse.model_validate(inv)


@router.patch("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(investment_id: int, data: InvestmentUpdate, current_user: CurrentUser, session: DBSession) -> InvestmentResponse:
    service = InvestmentService(session)
    inv = await service.update(investment_id, current_user.id, data)
    return InvestmentResponse.model_validate(inv)


@router.delete("/{investment_id}", status_code=204)
async def delete_investment(investment_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = InvestmentService(session)
    await service.delete(investment_id, current_user.id)


# ── Transações ────────────────────────────────────────────────────────────────

@router.post("/{investment_id}/transactions", response_model=InvestmentResponse, status_code=201)
async def add_transaction(investment_id: int, data: InvestmentTransactionCreate, current_user: CurrentUser, session: DBSession) -> InvestmentResponse:
    service = InvestmentService(session)
    inv = await service.add_transaction(investment_id, current_user.id, data)
    return InvestmentResponse.model_validate(inv)


@router.delete("/{investment_id}/transactions/{tx_id}", response_model=InvestmentResponse)
async def delete_transaction(investment_id: int, tx_id: int, current_user: CurrentUser, session: DBSession) -> InvestmentResponse:
    service = InvestmentService(session)
    inv = await service.delete_transaction(investment_id, tx_id, current_user.id)
    return InvestmentResponse.model_validate(inv)
