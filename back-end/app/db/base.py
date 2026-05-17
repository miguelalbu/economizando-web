from app.models.base import Base  # noqa: F401

# Importar todos os models aqui para que o Alembic detecte as tabelas
from app.models.user import User  # noqa: F401
from app.models.income import Income  # noqa: F401
from app.models.credit_card import CreditCard  # noqa: F401
from app.models.bill import Bill  # noqa: F401
from app.models.expense import Expense  # noqa: F401
from app.models.investment import Investment  # noqa: F401
