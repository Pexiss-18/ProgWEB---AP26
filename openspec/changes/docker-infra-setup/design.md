## Context

O projeto é uma aplicação web para barbearia com backend FastAPI e frontend Next.js. Atualmente, ambos os serviços rodam diretamente na máquina do desenvolvedor, exigindo instalação manual de Python, Node.js e PostgreSQL. Não há padronização de ambiente, o que gera inconsistências entre máquinas e dificulta o processo de deploy.

A containerização via Docker resolve esse problema ao encapsular cada serviço com suas dependências, garantindo comportamento consistente em qualquer ambiente que tenha Docker instalado.

## Goals / Non-Goals

**Goals:**
- Criar `Dockerfile` otimizado para o backend FastAPI (multi-stage não necessário por ser desenvolvimento inicial)
- Criar `Dockerfile` para o frontend Next.js com build de produção
- Criar `docker-compose.yml` orquestrando todos os 4 serviços: backend, frontend, db (PostgreSQL 16), pgadmin
- Configurar rede Docker interna para comunicação entre serviços
- Configurar volumes para persistência de dados do PostgreSQL e PgAdmin
- Configurar healthcheck no PostgreSQL para que o backend só inicie após o banco estar pronto
- Executar migrações Alembic automaticamente no startup do backend
- Fornecer `.env.docker.example` com todas as variáveis necessárias

**Non-Goals:**
- Configuração de CI/CD ou deploy em cloud
- Configuração de HTTPS/TLS (nginx reverse proxy)
- Ambiente de produção com múltiplos workers (gunicorn)
- Orquestração com Kubernetes

## Decisions

### D1: Base Image do Backend — `python:3.12-slim`

**Decisão**: Usar `python:3.12-slim` como base.

**Rationale**: A imagem `slim` reduz o tamanho final (~50MB vs ~900MB full) sem sacrificar compatibilidade. O `psycopg2-binary` já inclui os binários necessários, dispensando a instalação de `libpq-dev`.

**Alternativas consideradas**:
- `python:3.12-alpine`: ainda menor, mas tem incompatibilidades com `psycopg2-binary` e `passlib[bcrypt]` que exigem compilação de C extensions, aumentando complexidade.
- `python:3.12` (full): desnecessariamente grande para este caso.

---

### D2: Base Image do Frontend — `node:20-alpine` com multi-stage

**Decisão**: Usar multi-stage build: `node:20-alpine` para build e `node:20-alpine` para runtime com apenas os artefatos necessários.

**Rationale**: Next.js standalone output (`output: 'standalone'` no `next.config.ts`) copia apenas os arquivos necessários para produção, reduzindo drasticamente o tamanho da imagem final. Alpine reduz ainda mais o footprint.

**Alternativas consideradas**:
- Single-stage com Node.js completo: imagem final muito grande (~1GB) incluindo `node_modules` de desenvolvimento.

---

### D3: Execução de Migrações no Startup do Backend

**Decisão**: O `CMD` do backend executa `alembic upgrade head` antes de iniciar o Uvicorn, usando um entrypoint shell script.

**Rationale**: Garante que o schema do banco esteja sempre atualizado ao subir o container, sem necessidade de passo manual.

**Riscos**: Se a migração falhar, o container para sem iniciar a API (comportamento desejado — fail fast).

---

### D4: PostgreSQL 16 com Volume Nomeado

**Decisão**: Usar `postgres:16-alpine` com volume `postgres_data` nomeado.

**Rationale**: Volumes nomeados são gerenciados pelo Docker e sobrevivem a `docker compose down`, garantindo persistência. `alpine` reduz tamanho da imagem.

---

### D5: Comunicação entre Serviços via DNS Interno do Docker

**Decisão**: O backend usa `DATABASE_URL=postgresql://postgres:password@db:5432/barbearia` (hostname `db` resolve para o container PostgreSQL).

**Rationale**: Docker Compose cria automaticamente uma rede bridge e registra cada serviço pelo seu nome como hostname DNS. Isso é mais robusto que usar IPs fixos.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Alembic falha na migration e derruba o backend | Configurar `restart: on-failure` com limite e logs claros. O healthcheck do db garante que o banco está pronto antes de iniciar |
| Build do frontend Next.js standalone requer ajuste em `next.config.ts` | Adicionar `output: 'standalone'` no `next.config.ts` como parte das tasks |
| Volumes Docker não são backupeados automaticamente | Documentar comando de backup no README. Fora do escopo desta change |
| Senhas hardcoded no `.env.docker.example` | O arquivo de exemplo é apenas referência; `.env` real nunca deve ser commitado (já está no `.gitignore`) |

## Migration Plan

1. Desenvolvedores fazem `docker compose up --build` na raiz do projeto
2. Docker baixa imagens base, constrói imagens do backend e frontend
3. PostgreSQL inicializa e passa no healthcheck
4. Backend executa `alembic upgrade head` e inicia Uvicorn na porta 8000
5. Frontend conclui build e serve na porta 3000
6. PgAdmin fica disponível na porta 5050

**Rollback**: `docker compose down -v` remove containers e volumes. Ambiente local original permanece intacto.

## Open Questions

- O `next.config.ts` já possui `output: 'standalone'` configurado? (Verificar antes de implementar — se não, adicionar como subtask)
- Existe um `entrypoint.sh` no backend ou o script deve ser criado inline no Dockerfile?
