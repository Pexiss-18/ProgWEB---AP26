# Design: Backend API — Clean Architecture + TDD + PostgreSQL

## Context

Implementação da API FastAPI da Marlon Barber Shop utilizando **Clean Architecture** em 4 camadas isoladas: Domain, Use Cases, Adapters e API (Framework). O PostgreSQL substitui o SQLite para maturidade de produção e concurrent writes. TDD é a metodologia obrigatória: cada use case tem seus testes escritos antes da implementação.

## Goals / Non-goals

**Objetivos:**
- Implementar todas as rotas REST definidas nas specs
- Clean Architecture com inversão de dependência (use cases dependem de abstrações, não de SQLAlchemy)
- TDD: testes escritos antes da implementação de cada use case
- PostgreSQL via SQLAlchemy 2.x com Alembic para migrações
- JWT com expiração de 8 horas para autenticação do admin
- Integração Twilio para WhatsApp (falha silenciosa — não desfaz agendamento)

**Não-objetivos:**
- Login/senha para clientes finais
- Múltiplos administradores
- Pagamentos online
- Aprovação de templates Twilio para produção (Sandbox no MVP)

## Proposed Design

### Estrutura de Diretórios

```
backend/
├── app/
│   ├── domain/
│   │   └── entities.py          # Dataclasses: Admin, Servico, Agendamento
│   ├── use_cases/
│   │   ├── interfaces.py        # ABCs: IServicoRepository, IAgendamentoRepository, IWhatsAppGateway
│   │   ├── agendamentos/
│   │   │   ├── criar_agendamento.py
│   │   │   └── listar_slots_disponiveis.py
│   │   ├── servicos/
│   │   │   ├── listar_servicos.py
│   │   │   ├── criar_servico.py
│   │   │   ├── editar_servico.py
│   │   │   └── remover_servico.py
│   │   └── auth/
│   │       └── autenticar_admin.py
│   ├── adapters/
│   │   ├── repositories/
│   │   │   ├── servico_repo.py      # SQLAlchemy impl de IServicoRepository
│   │   │   └── agendamento_repo.py  # SQLAlchemy impl de IAgendamentoRepository
│   │   └── gateways/
│   │       └── twilio_gateway.py    # Twilio impl de IWhatsAppGateway
│   ├── api/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── servicos.py
│   │   │   └── agendamentos.py
│   │   ├── schemas/
│   │   │   ├── servico.py
│   │   │   └── agendamento.py
│   │   └── dependencies.py     # get_db, get_current_admin
│   ├── infrastructure/
│   │   ├── database.py         # Engine PostgreSQL, Base, get_db
│   │   ├── models.py           # SQLAlchemy ORM models
│   │   ├── security.py         # bcrypt + JWT helpers
│   │   └── settings.py         # Pydantic Settings (env vars)
│   └── main.py
├── tests/
│   ├── conftest.py             # Fixtures: engine PostgreSQL de test, TestClient
│   ├── unit/
│   │   ├── test_listar_slots.py
│   │   ├── test_criar_agendamento.py
│   │   ├── test_autenticar_admin.py
│   │   └── test_gerenciar_servicos.py
│   └── integration/
│       ├── test_api_agendamentos.py
│       ├── test_api_servicos.py
│       └── test_api_auth.py
├── alembic/
│   └── versions/               # Migrações geradas
├── .env.example
└── requirements.txt
```

### Modelo de Dados (PostgreSQL)

```mermaid
erDiagram
    ADMIN {
        int id PK
        string email "unique, not null"
        string senha_hash "bcrypt hash"
    }
    SERVICO {
        int id PK
        string nome "not null"
        float preco "not null"
        int slot_size "1=30min, 2=60min"
        bool ativo "default true"
    }
    AGENDAMENTO {
        int id PK
        int servico_id FK
        timestamp data_hora_inicio "not null"
        string status "PENDENTE|CONFIRMADO|CANCELADO"
        string nome_cliente "not null"
        string telefone_cliente "not null"
        timestamp criado_em "default now()"
    }
    SERVICO ||--o{ AGENDAMENTO : referencia
```

### Camada de Domain (`app/domain/entities.py`)

Entidades puras como `dataclass`, sem dependência de SQLAlchemy ou Pydantic:

```python
@dataclass
class Agendamento:
    id: int | None
    servico_id: int
    data_hora_inicio: datetime
    status: str  # "PENDENTE" | "CONFIRMADO" | "CANCELADO"
    nome_cliente: str
    telefone_cliente: str
```

### Camada de Use Cases — Interfaces (`app/use_cases/interfaces.py`)

```python
class IAgendamentoRepository(ABC):
    @abstractmethod
    def buscar_agendamentos_por_data(self, data: date) -> list[Agendamento]: ...
    @abstractmethod
    def criar(self, agendamento: Agendamento) -> Agendamento: ...
    @abstractmethod
    def atualizar_status(self, id: int, status: str) -> Agendamento: ...

class IWhatsAppGateway(ABC):
    @abstractmethod
    def enviar_confirmacao(self, telefone: str, dados: dict) -> None: ...
```

### Regra de Negócio — Slots Disponíveis

O use case `listar_slots_disponiveis.py` implementa:

1. Gera todos os slots do dia: `09:00` a `18:00` em intervalos de 30min
2. Para cada agendamento existente, marca como ocupados os slots de `data_hora_inicio` até `data_hora_inicio + slot_size * 30min`
3. Para o `slot_size` do serviço solicitado, filtra slots onde `slot_inicio + slot_size * 30min` não colide com nenhum ocupado
4. Utiliza **transação com `SELECT FOR UPDATE`** no repositório para evitar race condition no `POST /api/agendamentos`

### Autenticação JWT

- `POST /api/admin/login` → valida bcrypt → retorna `{ access_token, token_type }`
- Token expira em **8 horas**
- Dependência `get_current_admin` em todos os routers `/api/admin/*`
- Único admin cadastrado via seed/migration inicial

### Integração Twilio (Gateway Pattern)

```python
class TwilioWhatsAppGateway(IWhatsAppGateway):
    def enviar_confirmacao(self, telefone: str, dados: dict) -> None:
        try:
            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
                to=f"whatsapp:+55{telefone}",
                body=self._formatar_mensagem(dados)
            )
        except Exception as e:
            logger.error(f"Twilio falhou: {e}")  # Falha silenciosa
```

No use case `CriarAgendamento`, a chamada ao gateway é feita **após** o commit do banco — falha do Twilio não reverte o agendamento.

### Pydantic Schemas (Type-safety ponta a ponta)

```python
# Request
class AgendamentoCreate(BaseModel):
    servico_id: int
    data_hora_inicio: datetime
    nome_cliente: str = Field(min_length=2)
    telefone_cliente: str = Field(pattern=r"^\d{10,11}$")

# Response
class AgendamentoResponse(AgendamentoCreate):
    id: int
    status: str
    model_config = ConfigDict(from_attributes=True)
```

### Configuração de Ambiente (`app/infrastructure/settings.py`)

```python
class Settings(BaseSettings):
    DATABASE_URL: str                  # postgresql://user:pass@host/db
    SECRET_KEY: str
    JWT_EXPIRE_HOURS: int = 8
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    model_config = SettingsConfigDict(env_file=".env")
```

## Risks / Trade-offs

- **PostgreSQL em testes**: O `conftest.py` precisará de uma instância PostgreSQL de test (DATABASE_URL de test via env var `TEST_DATABASE_URL`). Alternativamente, pode-se usar `pytest-postgresql` ou um banco de test separado.
- **Concorrência**: `SELECT FOR UPDATE` garante que dois requests simultâneos para o mesmo slot processem sequencialmente. Testado via cenário na spec `agendamento.md`.
- **Seed do Admin**: Uma migration Alembic inicial popula o único admin com email/senha configuráveis via variável de ambiente (não hardcoded).
