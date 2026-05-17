.PHONY: up down restart logs build shell migrate makemigrations test lint format help

# Variáveis
COMPOSE = docker compose
BACKEND = economiza_backend

help:
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  make up              - Sobe todos os containers"
	@echo "  make down            - Para e remove os containers"
	@echo "  make restart         - Reinicia os containers"
	@echo "  make logs            - Exibe logs em tempo real"
	@echo "  make build           - (Re)builda as imagens"
	@echo "  make shell           - Abre shell no container do backend"
	@echo "  make migrate         - Aplica as migrations (alembic upgrade head)"
	@echo "  make makemigrations  - Cria nova migration (use MSG='descricao')"
	@echo "  make test            - Roda os testes"
	@echo "  make lint            - Roda o linter (ruff)"
	@echo "  make format          - Formata o código (ruff format)"
	@echo ""

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

build:
	$(COMPOSE) build

shell:
	$(COMPOSE) exec backend bash

migrate:
	$(COMPOSE) exec backend alembic upgrade head

makemigrations:
	$(COMPOSE) exec backend alembic revision --autogenerate -m "$(MSG)"

test:
	$(COMPOSE) exec backend pytest tests/ -v

lint:
	$(COMPOSE) exec backend ruff check app/

format:
	$(COMPOSE) exec backend ruff format app/
