## 1. Preparação do Backend

- [x] 1.1 Criar `backend/entrypoint.sh` com script que executa `alembic upgrade head` e depois inicia `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- [x] 1.2 Criar `backend/Dockerfile` baseado em `python:3.12-slim`, copiando `requirements.txt`, instalando dependências e definindo `ENTRYPOINT ["/entrypoint.sh"]`
- [x] 1.3 Adicionar `.dockerignore` em `backend/` excluindo `__pycache__`, `*.pyc`, `.env`, `test.db`, `.pytest_cache` e pasta `tests/`

## 2. Preparação do Frontend

- [x] 2.1 Verificar e adicionar `output: 'standalone'` em `frontend/next.config.ts` se ainda não estiver presente (necessário para o multi-stage build)
- [x] 2.2 Criar `frontend/Dockerfile` com multi-stage build: stage `deps` (instala dependências), stage `builder` (executa `next build`), stage `runner` (copia apenas `.next/standalone`, `.next/static` e `public/`)
- [x] 2.3 Adicionar `.dockerignore` em `frontend/` excluindo `node_modules`, `.next`, `.env*`, `__tests__` e `*.test.*`

## 3. Docker Compose e Variáveis de Ambiente

- [x] 3.1 Criar `.env.docker.example` na raiz do projeto com todas as variáveis necessárias: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DATABASE_URL`, `SECRET_KEY`, `JWT_EXPIRE_HOURS`, `PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`, `NEXT_PUBLIC_API_URL` e variáveis Twilio
- [x] 3.2 Copiar `.env.docker.example` para `.env` (se ainda não existir) e preencher com valores de desenvolvimento local
- [x] 3.3 Verificar que `.env` está no `.gitignore` da raiz do projeto
- [x] 3.4 Criar `docker-compose.yml` na raiz do projeto com os 4 serviços: `db` (postgres:16-alpine com healthcheck `pg_isready`), `backend` (build de `./backend`, porta 8000, depends_on db com condition `service_healthy`), `frontend` (build de `./frontend`, porta 3000, depends_on backend), `pgadmin` (dpage/pgadmin4:latest, porta 5050)
- [x] 3.5 Configurar rede interna `app-network` do tipo bridge no `docker-compose.yml` e associar todos os serviços a ela
- [x] 3.6 Configurar volume nomeado `postgres_data` para o serviço `db` e volume `pgadmin_data` para o PgAdmin

## 4. Verificação e Documentação

- [x] 4.1 Executar `docker compose build` na raiz e confirmar que as imagens do backend e frontend são construídas sem erros
- [x] 4.2 Executar `docker compose up` e verificar que todos os 4 serviços sobem corretamente (backend na porta 8000, frontend na porta 3000, pgadmin na porta 5050)
- [x] 4.3 Verificar que o backend executa as migrações do Alembic automaticamente consultando os logs com `docker compose logs backend`
- [x] 4.4 Acessar `http://localhost:8000/docs` e confirmar que a documentação Swagger do FastAPI está disponível
- [x] 4.5 Acessar `http://localhost:3000` e confirmar que o frontend Next.js carrega corretamente
- [x] 4.6 Acessar `http://localhost:5050`, fazer login no PgAdmin e adicionar server apontando para `db:5432`
- [x] 4.7 Executar `docker compose down` e `docker compose up` novamente confirmando que os dados do PostgreSQL persistem
- [x] 4.8 Adicionar seção "Docker" no `README.md` raiz (ou criar um se não existir) documentando os comandos: `docker compose up --build`, `docker compose down`, `docker compose down -v` (apaga dados), variáveis de ambiente e portas expostas
