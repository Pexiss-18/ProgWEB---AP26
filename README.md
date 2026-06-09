# Barbearia — Sistema de Agendamento

Sistema web para barbearia com agendamento de serviços e painel administrativo.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | FastAPI + SQLAlchemy + Alembic |
| Frontend | Next.js 16 + TypeScript + TailwindCSS |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT |

---

## 🐳 Rodando com Docker

### Pré-requisitos

- [Docker Engine](https://docs.docker.com/engine/install/) instalado
- [Docker Compose v2](https://docs.docker.com/compose/install/) (incluso no Docker Desktop)

### Configuração inicial

```bash
# 1. Copie o arquivo de variáveis de exemplo
cp .env.docker.example .env

# 2. (Opcional) Edite .env com suas configurações
```

### Subir todos os serviços

```bash
docker compose up --build
```

Na primeira execução, o Docker irá:
1. Construir as imagens do backend e frontend
2. Iniciar o PostgreSQL e aguardar o healthcheck
3. Executar as migrações do Alembic automaticamente
4. Iniciar o backend FastAPI e o frontend Next.js

### Serviços e portas

| Serviço | URL | Descrição |
|---|---|---|
| Backend API | http://localhost:8000 | FastAPI REST API |
| Swagger Docs | http://localhost:8000/docs | Documentação interativa |
| Frontend | http://localhost:3000 | Aplicação Next.js |
| PgAdmin | http://localhost:5050 | Interface do PostgreSQL |

### Credenciais padrão (desenvolvimento)

**PgAdmin:**
- Email: `admin@barbershop.com`
- Senha: `pgadmin123`

**Conectar ao banco no PgAdmin:**
- Host: `db`
- Porta: `5432`
- Usuário: `postgres`
- Senha: `postgres`
- Banco: `barbearia`

### Comandos úteis

```bash
# Subir em background (detached)
docker compose up -d --build

# Ver logs em tempo real
docker compose logs -f

# Ver logs apenas do backend
docker compose logs -f backend

# Parar todos os serviços (dados preservados)
docker compose down

# Parar e APAGAR todos os dados (volumes)
docker compose down -v

# Recriar apenas um serviço
docker compose up --build backend

# Acessar shell do container do backend
docker compose exec backend sh
```

### Variáveis de ambiente

Veja `.env.docker.example` para a lista completa de variáveis disponíveis.

> ⚠️ **Nunca commite o arquivo `.env` com credenciais reais!** Ele já está no `.gitignore`.

---

## 🖥️ Desenvolvimento local (sem Docker)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O banco de dados precisa estar rodando localmente. Use o `DATABASE_URL` do `backend/.env.example` com `localhost` em vez de `db`.
