from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate
from app.services.income import IncomeService

router = APIRouter(prefix="/incomes", tags=["incomes"])


@router.post("", response_model=IncomeResponse, status_code=201)
async def create_income(data: IncomeCreate, current_user: CurrentUser, session: DBSession) -> IncomeResponse:
    service = IncomeService(session)
    income = await service.create(current_user.id, data)
    return IncomeResponse.model_validate(income)


@router.get("", response_model=list[IncomeResponse])
async def list_incomes(
    current_user: CurrentUser,
    session: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> list[IncomeResponse]:
    service = IncomeService(session)
    incomes = await service.get_all(current_user.id, skip, limit)
    return [IncomeResponse.model_validate(i) for i in incomes]


@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income(income_id: int, current_user: CurrentUser, session: DBSession) -> IncomeResponse:
    service = IncomeService(session)
    income = await service.get_by_id(income_id, current_user.id)
    return IncomeResponse.model_validate(income)


@router.patch("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: int, data: IncomeUpdate, current_user: CurrentUser, session: DBSession
) -> IncomeResponse:
    service = IncomeService(session)
    income = await service.update(income_id, current_user.id, data)
    return IncomeResponse.model_validate(income)


@router.delete("/{income_id}", status_code=204)
async def delete_income(income_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = IncomeService(session)
    await service.delete(income_id, current_user.id)
