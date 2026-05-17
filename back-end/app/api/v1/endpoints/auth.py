from fastapi import APIRouter

from app.core.dependencies import DBSession
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
async def register(data: UserCreate, session: DBSession) -> Token:
    service = AuthService(session)
    return await service.register(data)


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, session: DBSession) -> Token:
    service = AuthService(session)
    return await service.login(data)
