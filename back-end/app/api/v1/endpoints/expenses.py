from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expense import ExpenseService

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponse, status_code=201)
async def create_expense(data: ExpenseCreate, current_user: CurrentUser, session: DBSession) -> ExpenseResponse:
    service = ExpenseService(session)
    expense = await service.create(current_user.id, data)
    return ExpenseResponse.model_validate(expense)


@router.get("", response_model=list[ExpenseResponse])
async def list_expenses(
    current_user: CurrentUser,
    session: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> list[ExpenseResponse]:
    service = ExpenseService(session)
    expenses = await service.get_all(current_user.id, skip, limit)
    return [ExpenseResponse.model_validate(e) for e in expenses]


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, current_user: CurrentUser, session: DBSession) -> ExpenseResponse:
    service = ExpenseService(session)
    expense = await service.get_by_id(expense_id, current_user.id)
    return ExpenseResponse.model_validate(expense)


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int, data: ExpenseUpdate, current_user: CurrentUser, session: DBSession
) -> ExpenseResponse:
    service = ExpenseService(session)
    expense = await service.update(expense_id, current_user.id, data)
    return ExpenseResponse.model_validate(expense)


@router.delete("/{expense_id}", status_code=204)
async def delete_expense(expense_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = ExpenseService(session)
    await service.delete(expense_id, current_user.id)
