## ADDED Requirements

### Requirement: Dockerfile do Backend
O projeto SHALL possuir um `Dockerfile` em `backend/` baseado em `python:3.12-slim` que instale todas as dependências do `requirements.txt` e exponha a aplicação FastAPI via Uvicorn na porta 8000.

#### Scenario: Build bem-sucedido do backend
- **WHEN** o usuário executa `docker build -t backend .` dentro da pasta `backend/`
- **THEN** a imagem é construída sem erros e o container inicia o Uvicorn na porta 8000

#### Scenario: Migrações executadas no startup
- **WHEN** o container do backend inicia
- **THEN** o sistema executa `alembic upgrade head` antes de iniciar o Uvicorn, e se a migration falhar, o container encerra com código de erro não-zero

#### Scenario: Variáveis de ambiente injetadas
- **WHEN** o container é iniciado com variáveis de ambiente (`DATABASE_URL`, `SECRET_KEY`, etc.)
- **THEN** a aplicação lê essas variáveis corretamente via `pydantic-settings` sem hardcoding de valores

#### Scenario: Comunicação com banco de dados via hostname Docker
- **WHEN** `DATABASE_URL` aponta para o hostname `db` (ex: `postgresql://user:pass@db:5432/barbearia`)
- **THEN** o backend conecta-se ao PostgreSQL com sucesso usando a resolução DNS interna do Docker
