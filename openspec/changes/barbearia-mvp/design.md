# Design: Sistema de Barbearia (MVP 60h)

## Context

O MVP do Sistema de Barbearia exige uma implementação muito ágil devido à restrição de 60 horas. Precisamos de uma arquitetura que ofereça segurança de tipos ponta a ponta e interfaces de usuário responsivas, mas com a menor complexidade de infraestrutura possível. Por isso, a escolha de Next.js (com Server Components e server actions quando útil) integrado com FastAPI via REST. O banco SQLite foi escolhido pela ausência de configuração de servidor, ideal para o MVP, e o SQLAlchemy fornece um ORM robusto para futuras migrações (ex: PostgreSQL).

## Goals / Non-goals

**Objetivos:**
- Criar a API REST com FastAPI e validação forte (Pydantic).
- Implementar o banco de dados com SQLite + SQLAlchemy, com estrutura simplificada de "Slots".
- Criar a interface do cliente "guest-only" (sem login) no Next.js.
- Criar a interface de Dashboard do Admin (com login).
- Redirecionar clientes para confirmação via WhatsApp usando Deep Link (`wa.me`) após o agendamento no banco.

**Não-Objetivos (Fora do Escopo):**
- Integração oficial com a API do WhatsApp/Meta.
- Pagamentos online ou integração de gateway.
- Sistema de login/senha para clientes finais.
- Lógica complexa de tempo (ex: serviços de 15min e 45min intercalados quebrando slots). Vamos fixar a "moeda de tempo" em blocos de 30 minutos.

## Proposed Design

### Arquitetura de Componentes
1. **Frontend (Next.js)**
   - App Router (`/app`)
   - Rotas Públicas: `/` (Vitrine), `/agendar` (Fluxo de marcação)
   - Rotas Privadas (Admin): `/admin/login`, `/admin/dashboard`
   - Data Fetching: Fetch API nativo do Next.js comunicando com o FastAPI.
   - UI: TailwindCSS + Shadcn/UI. Formulários com React Hook Form + Zod.

2. **Backend (FastAPI)**
   - API modular usando APIRouter.
   - Rotas principais: `/api/servicos`, `/api/profissionais`, `/api/agendamentos`.
   - Autenticação Simples: JWT apenas para o fluxo de Admin (rotas `/api/admin/*`).
   - Validação de entrada/saída com Pydantic schemas.

### Modelo de Dados (SQLite)

```mermaid
erDiagram
    PROFISSIONAL {
        int id PK
        string nome
        string email
        string senha_hash "Para login de admin"
    }
    SERVICO {
        int id PK
        string nome
        float preco
        int slot_size "Múltiplo de 30 minutos. Ex: 1 = 30m, 2 = 1h"
    }
    AGENDAMENTO {
        int id PK
        int profissional_id FK
        int servico_id FK
        datetime data_hora_inicio
        string status "Ex: PENDENTE, CONFIRMADO, CANCELADO"
        string nome_cliente "Contato do hóspede"
        string telefone_cliente "WhatsApp do hóspede"
    }
    PROFISSIONAL ||--o{ AGENDAMENTO : possui
    SERVICO ||--o{ AGENDAMENTO : referencia
```

### Regras de Negócio de Tempo
- O calendário só renderiza horários em intervalos de 30 minutos (ex: 09:00, 09:30, 10:00).
- Quando o usuário solicita os horários disponíveis (`GET /api/agendamentos/disponiveis`), o FastAPI:
  1. Verifica a configuração de horário de trabalho (ex: 09h às 18h).
  2. Subtrai os slots (`data_hora_inicio` + `slot_size` do Serviço) que já existem na tabela `Agendamento` para aquele `profissional_id` naquela data.
  3. Retorna apenas os slots viáveis para o tamanho do serviço solicitado.

## Risks / Trade-offs

- **Fricção do WhatsApp**: Confiar que o cliente vai apertar o botão "Enviar" após ser redirecionado para o WhatsApp. É um risco aceitável para o MVP, mas requer uma boa copy na tela de sucesso ("Agendamento registrado! Só falta você enviar a mensagem para confirmar com o barbeiro").
- **Concorrência**: O SQLite lida bem com a concorrência baixa esperada de uma barbearia local, mas em uso massivo simultâneo poderia bloquear a escrita (database lock). Considerado risco baixo para o contexto universitário.
- **Segurança de Slots**: Usaremos transações no SQLAlchemy para garantir que dois usuários não aloquem o mesmo slot no mesmo exato segundo.
