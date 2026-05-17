from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.investment import InvestmentCreate, InvestmentResponse, InvestmentUpdate
from app.services.investment import InvestmentService

router = APIRouter(prefix="/investments", tags=["investments"])


@router.post("", response_model=InvestmentResponse, status_code=201)
async def create_investment(
    data: InvestmentCreate, current_user: CurrentUser, session: DBSession
) -> InvestmentResponse:
    service = InvestmentService(session)
    investment = await service.create(current_user.id, data)
    return InvestmentResponse.model_validate(investment)


@router.get("", response_model=list[InvestmentResponse])
async def list_investments(
    current_user: CurrentUser,
    session: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
) -> list[InvestmentResponse]:
    service = InvestmentService(session)
    investments = await service.get_all(current_user.id, skip, limit)
    return [InvestmentResponse.model_validate(i) for i in investments]


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(
    investment_id: int, current_user: CurrentUser, session: DBSession
) -> InvestmentResponse:
    service = InvestmentService(session)
    investment = await service.get_by_id(investment_id, current_user.id)
    return InvestmentResponse.model_validate(investment)


@router.patch("/{investment_id}", response_model=InvestmentResponse)
async def update_investment(
    investment_id: int, data: InvestmentUpdate, current_user: CurrentUser, session: DBSession
) -> InvestmentResponse:
    service = InvestmentService(session)
    investment = await service.update(investment_id, current_user.id, data)
    return InvestmentResponse.model_validate(investment)


@router.delete("/{investment_id}", status_code=204)
async def delete_investment(investment_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = InvestmentService(session)
    await service.delete(investment_id, current_user.id)
