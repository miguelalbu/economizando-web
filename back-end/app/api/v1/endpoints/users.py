from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.user import UserResponse, UserUpdate
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(data: UserUpdate, current_user: CurrentUser, session: DBSession) -> UserResponse:
    service = UserService(session)
    user = await service.update_user(current_user.id, data)
    return UserResponse.model_validate(user)
