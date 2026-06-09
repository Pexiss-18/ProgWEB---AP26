# Proposal: Backend API — Clean Architecture + TDD + PostgreSQL

## Motivation

O backend atual da Marlon Barber Shop é um esqueleto FastAPI sem rotas de negócio implementadas. As 5 specs existentes (`agendamento`, `autenticacao`, `dashboard`, `servicos`, `whatsapp`) definem com precisão o comportamento esperado, mas nenhuma camada de domínio, repositório ou caso de uso existe ainda.

O objetivo desta mudança é construir a **API REST completa** seguindo os princípios da **Clean Architecture** (Entidades → Casos de Uso → Adaptadores → Framework), com **TDD** como metodologia de desenvolvimento, e migrando o banco de dados de SQLite para **PostgreSQL**, conforme exigido pelo config do projeto.

## Proposed Solution

Estruturar o backend em camadas explícitas dentro de `backend/app/`:

```
backend/
└── app/
    ├── domain/            # Entidades puras de domínio (sem dependência de framework)
    │   └── entities.py    # Agendamento, Servico, Admin (dataclasses/Pydantic models)
    ├── use_cases/         # Regras de negócio (orquestração sem acesso direto ao banco)
    │   ├── agendamentos/
    │   ├── servicos/
    │   └── auth/
    ├── adapters/          # Implementações concretas (repositórios SQLAlchemy)
    │   ├── repositories/
    │   └── gateways/      # Twilio WhatsApp gateway
    ├── api/               # Camada de entrega (FastAPI routers + schemas Pydantic)
    │   ├── routers/
    │   └── schemas/
    ├── infrastructure/    # Config, banco, segurança
    │   ├── database.py
    │   ├── security.py    # JWT helpers
    │   └── settings.py
    └── main.py
```

**Fluxo de dependência**: `api` → `use_cases` → `domain` (as `adapters` implementam interfaces definidas nos `use_cases`).

### Endpoints a implementar

| Método | Rota | Acesso | Spec |
|---|---|---|---|
| `POST` | `/api/admin/login` | Público | autenticacao |
| `GET` | `/api/servicos` | Público | servicos |
| `POST` | `/api/agendamentos` | Público | agendamento + whatsapp |
| `GET` | `/api/agendamentos/disponíveis` | Público | agendamento |
| `POST` | `/api/admin/servicos` | Admin JWT | servicos |
| `PUT` | `/api/admin/servicos/{id}` | Admin JWT | servicos |
| `DELETE` | `/api/admin/servicos/{id}` | Admin JWT | servicos |
| `GET` | `/api/admin/agendamentos` | Admin JWT | dashboard |
| `PATCH` | `/api/admin/agendamentos/{id}/status` | Admin JWT | dashboard |
| `POST` | `/api/admin/agendamentos` | Admin JWT | dashboard |

## Impact

- **Backend**: Reestruturação completa do `app/` em camadas de Clean Architecture. Migração de SQLite → PostgreSQL. Implementação de todos os endpoints definidos nas specs.
- **Testes**: Cada caso de uso terá testes unitários escritos **antes** da implementação (TDD). Testes de integração via `TestClient` para os routers.
- **Infraestrutura**: `conftest.py` atualizado para PostgreSQL de teste (via `psycopg2` e banco de teste isolado). Variáveis de ambiente para Twilio e JWT configuradas via `.env`.
- **Sem impacto no Frontend**: A API segue os contratos REST já esperados pelas specs, compatível com o Next.js frontend.
