from fastapi import APIRouter

from app.api.v1.endpoints import auth, bills, credit_cards, expenses, incomes, investments, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(incomes.router)
api_router.include_router(credit_cards.router)
api_router.include_router(bills.router)
api_router.include_router(expenses.router)
api_router.include_router(investments.router)
