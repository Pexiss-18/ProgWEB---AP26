# Tasks: Sistema de Barbearia (MVP 60h)

> **Regra TDD**: Toda implementação é precedida pelo seu teste. 🔴 Escrever teste → 🟢 Implementar → 🔵 Refatorar.

---

## 1. Setup da Infraestrutura e Testes

- [x] 1.1 Inicializar projeto backend com FastAPI e SQLite (SQLAlchemy + Alembic).
- [x] 1.2 Configurar ambiente de testes backend: `pytest`, `pytest-asyncio`, `httpx`. Criar `tests/conftest.py` com fixture de banco `:memory:` e `AsyncClient`.
- [x] 1.3 Inicializar projeto frontend com Next.js (App Router), TailwindCSS e Shadcn/UI.
- [x] 1.4 Configurar ambiente de testes frontend: `Vitest` + `@testing-library/react` + `user-event`. Criar `__tests__/setup.ts`.
- [x] 1.5 Validar que `pytest` e `vitest` rodam com um teste trivial cada.

---

## 2. Backend: Modelo de Dados e Schemas (TDD)

- [ ] 2.1 🔴 Escrever testes para os modelos SQLAlchemy (`Admin`, `Servico`, `Agendamento`): criação, campos obrigatórios, FK.
- [ ] 2.2 🟢 Criar os modelos SQLAlchemy até todos os testes passarem.
- [ ] 2.3 🔴 Escrever testes para os Pydantic schemas: validação de campos, serialização, erros esperados.
- [ ] 2.4 🟢 Criar os Pydantic schemas até todos os testes passarem.

---

## 3. Backend: API de Serviços (TDD)

- [ ] 3.1 🔴 Escrever teste para `GET /api/servicos`: retorna lista com nome, preço, slot_size.
- [ ] 3.2 🟢 Implementar rota `GET /api/servicos` até o teste passar.

---

## 4. Backend: Autenticação Admin (TDD)

- [ ] 4.1 🔴 Escrever teste para `POST /api/admin/login`: credenciais válidas → JWT; inválidas → 401.
- [ ] 4.2 🟢 Implementar rota `POST /api/admin/login` até os testes passarem.

---

## 5. Backend: Motor de Agendamento (TDD — Regra de Negócio Crítica)

- [ ] 5.1 🔴 Escrever testes unitários para cálculo de slots: dia vazio, parcialmente ocupado, lotado, serviço de 2 slots.
- [ ] 5.2 🟢 Implementar lógica de cálculo de slots até os testes passarem.
- [ ] 5.3 🔴 Escrever teste para `GET /api/agendamentos/disponiveis?data=YYYY-MM-DD&servico_id=X`.
- [ ] 5.4 🟢 Implementar rota até o teste passar.
- [ ] 5.5 🔴 Escrever testes para `POST /api/agendamentos`: válido (201), double-booking (409), dados inválidos (422).
- [ ] 5.6 🟢 Implementar rota com validação de colisão até os testes passarem.
- [ ] 5.7 🔵 Refatorar: extrair lógica de slots para módulo/serviço isolado se necessário.

---

## 6. Frontend: Home Page (TDD)

- [ ] 6.1 🔴 Escrever teste para `/`: renderiza nome da barbearia e lista de serviços da API (mock de fetch).
- [ ] 6.2 🟢 Criar Home Page até o teste passar.

---

## 7. Frontend: Fluxo de Agendamento (TDD)

- [ ] 7.1 🔴 Escrever teste para Step 1 (`/agendar/1`): lista serviços e permite seleção.
- [ ] 7.2 🟢 Implementar Step 1 até o teste passar.
- [ ] 7.3 🔴 Escrever teste para Step 2 (`/agendar/2`): mostra calendário e slots disponíveis.
- [ ] 7.4 🟢 Implementar Step 2 até o teste passar.
- [ ] 7.5 🔴 Escrever teste para Step 3 (`/agendar/3`): bloqueia envio sem Nome/WhatsApp; com dados válidos chama a API.
- [ ] 7.6 🟢 Implementar Step 3 até o teste passar.

---

## 8. Frontend: Confirmação WhatsApp (TDD)

- [ ] 8.1 🔴 Escrever teste para `/agendar/sucesso`: exibe dados da reserva e link `wa.me` pré-preenchido.
- [ ] 8.2 🟢 Implementar tela de sucesso até o teste passar.

---

## 9. Frontend: Dashboard Admin (TDD)

- [ ] 9.1 🔴 Escrever teste para `/admin/login`: submete credenciais, redireciona com token válido; inválidas mostram erro.
- [ ] 9.2 🟢 Implementar página de login até o teste passar.
- [ ] 9.3 🔴 Escrever teste para `/admin/dashboard`: busca agendamentos do dia, lista clientes; sem token redireciona para login.
- [ ] 9.4 🟢 Implementar dashboard até o teste passar.
