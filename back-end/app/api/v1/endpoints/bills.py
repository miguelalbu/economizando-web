from fastapi import APIRouter, Query

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.bill import BillCreate, BillResponse, BillUpdate
from app.services.bill import BillService

router = APIRouter(prefix="/bills", tags=["bills"])


@router.post("", response_model=BillResponse, status_code=201)
async def create_bill(data: BillCreate, current_user: CurrentUser, session: DBSession) -> BillResponse:
    service = BillService(session)
    bill = await service.create(current_user.id, data)
    return BillResponse.model_validate(bill)


@router.get("", response_model=list[BillResponse])
async def list_bills(
    current_user: CurrentUser,
    session: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
) -> list[BillResponse]:
    service = BillService(session)
    bills = await service.get_all(current_user.id, skip, limit)
    return [BillResponse.model_validate(b) for b in bills]


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: int, current_user: CurrentUser, session: DBSession) -> BillResponse:
    service = BillService(session)
    bill = await service.get_by_id(bill_id, current_user.id)
    return BillResponse.model_validate(bill)


@router.patch("/{bill_id}", response_model=BillResponse)
async def update_bill(
    bill_id: int, data: BillUpdate, current_user: CurrentUser, session: DBSession
) -> BillResponse:
    service = BillService(session)
    bill = await service.update(bill_id, current_user.id, data)
    return BillResponse.model_validate(bill)


@router.patch("/{bill_id}/pay", response_model=BillResponse)
async def mark_bill_as_paid(bill_id: int, current_user: CurrentUser, session: DBSession) -> BillResponse:
    service = BillService(session)
    bill = await service.mark_as_paid(bill_id, current_user.id)
    return BillResponse.model_validate(bill)


@router.delete("/{bill_id}", status_code=204)
async def delete_bill(bill_id: int, current_user: CurrentUser, session: DBSession) -> None:
    service = BillService(session)
    await service.delete(bill_id, current_user.id)
