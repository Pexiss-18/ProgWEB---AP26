# Tasks: Backend API — Clean Architecture + TDD + PostgreSQL

## Fase 1 — Estrutura e Infraestrutura

- [x] **1.1** Criar estrutura de pastas da clean architecture dentro de `backend/app/`
- [x] **1.2** Configurar `infrastructure/settings.py` com Pydantic Settings
- [x] **1.3** Migrar `infrastructure/database.py` de SQLite para PostgreSQL
- [x] **1.4** Criar ORM models em `infrastructure/models.py`
- [x] **1.5** Criar/atualizar migration Alembic para PostgreSQL (alembic/env.py atualizado; rode `alembic revision --autogenerate -m "initial schema"`)
- [x] **1.6** Criar migration de seed do Admin inicial
- [x] **1.7** Atualizar `conftest.py` de testes para PostgreSQL
- [x] **1.8** Atualizar `requirements.txt`

---

## Fase 2 — Domain e Interfaces

- [x] **2.1** Criar entidades de domínio em `domain/entities.py`
- [x] **2.2** Criar interfaces de repositório em `use_cases/interfaces.py`

---

## Fase 3 — TDD: Use Cases de Serviços

- [x] **3.1** [TESTE PRIMEIRO] Escrever `tests/unit/test_gerenciar_servicos.py`
- [x] **3.2** Implementar use cases de serviços após os testes ficarem vermelhos

---

## Fase 4 — TDD: Use Cases de Agendamento

- [x] **4.1** [TESTE PRIMEIRO] Escrever `tests/unit/test_listar_slots.py`
- [x] **4.2** Implementar `use_cases/agendamentos/listar_slots_disponiveis.py`
- [x] **4.3** [TESTE PRIMEIRO] Escrever `tests/unit/test_criar_agendamento.py`
- [x] **4.4** Implementar `use_cases/agendamentos/criar_agendamento.py`

---

## Fase 5 — TDD: Use Case de Autenticação

- [x] **5.1** [TESTE PRIMEIRO] Escrever `tests/unit/test_autenticar_admin.py`
- [x] **5.2** Implementar `use_cases/auth/autenticar_admin.py`
- [x] **5.3** Implementar helpers em `infrastructure/security.py`

---

## Fase 6 — Adapters: Repositórios SQLAlchemy

- [x] **6.1** Implementar `adapters/repositories/servico_repo.py`
- [x] **6.2** Implementar `adapters/repositories/agendamento_repo.py`
- [x] **6.3** Implementar `adapters/repositories/admin_repo.py`
- [x] **6.4** Implementar `adapters/gateways/twilio_gateway.py`

---

## Fase 7 — API Layer (Routers + Schemas)

- [x] **7.1** Criar schemas Pydantic em `api/schemas/`
- [x] **7.2** Criar `api/dependencies.py`
- [x] **7.3** Implementar `api/routers/auth.py`
- [x] **7.4** Implementar `api/routers/servicos.py`
- [x] **7.5** Implementar `api/routers/agendamentos.py`
- [x] **7.6** Atualizar `main.py`

---

## Fase 8 — Testes de Integração

- [x] **8.1** Escrever `tests/integration/test_api_auth.py`
- [x] **8.2** Escrever `tests/integration/test_api_servicos.py`
- [x] **8.3** Escrever `tests/integration/test_api_agendamentos.py`

---

## Como Rodar os Testes

```bash
# Na pasta backend/
# Configure TEST_DATABASE_URL no .env antes de rodar

pytest tests/unit/          # Testes unitários (sem banco)
pytest tests/integration/   # Testes de integração (requer PostgreSQL)
pytest --cov=app            # Cobertura total
```
