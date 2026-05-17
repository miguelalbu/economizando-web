from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    income_day: int | None = Field(default=None, ge=1, le=31)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    income_day: int | None = Field(default=None, ge=1, le=31)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    income_day: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
