from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UserRepository(session)

    async def create_user(self, data: UserCreate) -> User:
        if await self.repo.email_exists(data.email):
            raise ConflictError("Este email já está cadastrado.")

        user = User(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
            income_day=data.income_day,
        )
        return await self.repo.create(user)

    async def get_user_by_id(self, user_id: int) -> User:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("Usuário não encontrado.")
        return user

    async def update_user(self, user_id: int, data: UserUpdate) -> User:
        user = await self.get_user_by_id(user_id)
        return await self.repo.update(user, data.model_dump(exclude_none=True))
