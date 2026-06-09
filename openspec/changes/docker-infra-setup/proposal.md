## Why

O projeto de barbearia possui backend (FastAPI + PostgreSQL) e frontend (Next.js) rodando apenas localmente sem containerização, dificultando a reprodutibilidade de ambientes e o processo de deploy. A criação de uma infraestrutura Docker padroniza o ambiente de desenvolvimento e produção, eliminando problemas de "funciona na minha máquina" e facilitando o onboarding.

## What Changes

- Criação de `Dockerfile` para o backend FastAPI (Python, Uvicorn, Alembic)
- Criação de `Dockerfile` para o frontend Next.js (Node.js, build de produção)
- Criação de `docker-compose.yml` na raiz do projeto orquestrando:
  - Serviço **backend** (FastAPI na porta 8000)
  - Serviço **frontend** (Next.js na porta 3000)
  - Serviço **db** (PostgreSQL 16 com volume persistente)
  - Serviço **pgadmin** (PgAdmin 4 na porta 5050 para administração do banco)
- Criação de arquivo `.env` de exemplo para variáveis do Docker Compose
- Configuração de rede interna Docker para comunicação entre serviços
- Healthchecks para o banco de dados garantindo que backend só inicie após PostgreSQL estar pronto
- Volume para persistência de dados do PostgreSQL e PgAdmin

## Capabilities

### New Capabilities

- `docker-backend`: Containerização do serviço FastAPI com suporte a migrações Alembic no startup
- `docker-frontend`: Containerização do serviço Next.js em modo produção (build otimizado)
- `docker-compose-orchestration`: Orquestração completa dos serviços (backend, frontend, db, pgadmin) com rede, volumes e dependências configurados

### Modified Capabilities

<!-- Nenhuma capacidade existente tem requisitos alterados. -->

## Impact

- **Arquivos novos**: `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `.env.docker.example`
- **Sem breaking changes**: Os arquivos locais existentes não são alterados; Docker é uma camada opcional sobre o ambiente atual
- **Dependências externas**: Docker Engine e Docker Compose v2 no ambiente de execução
- **Variáveis de ambiente**: `DATABASE_URL` do backend precisa apontar para o hostname do serviço `db` (não `localhost`) quando rodando via Docker
