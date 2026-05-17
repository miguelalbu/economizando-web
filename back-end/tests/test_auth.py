import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "name": "Miguel",
        "email": "miguel@example.com",
        "password": "senha123",
        "income_day": 15,
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "name": "Miguel",
        "email": "miguel@example.com",
        "password": "senha123",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "miguel@example.com",
        "password": "senha123",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "name": "Miguel",
        "email": "miguel@example.com",
        "password": "senha123",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "miguel@example.com",
        "password": "senhaerrada",
    })
    assert response.status_code == 401
