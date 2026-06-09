## ADDED Requirements

### Requirement: Orquestração com Docker Compose
O projeto SHALL possuir um `docker-compose.yml` na raiz que orquestre os serviços `backend`, `frontend`, `db` (PostgreSQL 16-alpine) e `pgadmin` (PgAdmin4 latest), com rede interna e volumes persistentes configurados.

#### Scenario: Todos os serviços sobem com um único comando
- **WHEN** o usuário executa `docker compose up --build` na raiz do projeto
- **THEN** os 4 serviços (backend, frontend, db, pgadmin) são iniciados e ficam acessíveis nas suas respectivas portas (8000, 3000, 5432, 5050)

#### Scenario: Backend aguarda banco de dados estar pronto
- **WHEN** o Docker Compose inicia os serviços
- **THEN** o serviço `backend` só inicia após o healthcheck do serviço `db` passar (`pg_isready` retorna sucesso), usando `depends_on` com `condition: service_healthy`

#### Scenario: Persistência de dados do PostgreSQL
- **WHEN** o usuário executa `docker compose down` (sem `-v`) e depois `docker compose up` novamente
- **THEN** os dados do banco de dados são preservados porque estão armazenados no volume nomeado `postgres_data`

#### Scenario: Acesso ao PgAdmin
- **WHEN** o usuário acessa `http://localhost:5050` no navegador
- **THEN** a interface do PgAdmin4 é exibida e o usuário pode fazer login com as credenciais configuradas nas variáveis de ambiente (`PGADMIN_DEFAULT_EMAIL`, `PGADMIN_DEFAULT_PASSWORD`)

#### Scenario: Comunicação interna entre serviços
- **WHEN** o backend tenta conectar ao banco de dados usando `DATABASE_URL=postgresql://...@db:5432/barbearia`
- **THEN** o hostname `db` resolve corretamente para o container PostgreSQL via rede Docker interna `app-network`

#### Scenario: Arquivo de variáveis de ambiente de exemplo
- **WHEN** o desenvolvedor clona o repositório
- **THEN** existe um arquivo `.env.docker.example` na raiz com todas as variáveis necessárias documentadas, que pode ser copiado para `.env` e customizado

#### Scenario: Isolamento de rede
- **WHEN** os serviços estão rodando
- **THEN** apenas as portas explicitamente mapeadas (8000, 3000, 5050) são acessíveis do host; a porta 5432 do PostgreSQL é acessível apenas internamente aos outros containers
