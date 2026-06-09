# Spec: Confirmação via WhatsApp (Twilio)

## Contexto e Motivação da Mudança

O modelo anterior dependia de um deep link `wa.me` onde **o cliente** precisava manualmente apertar "Enviar" no WhatsApp para confirmar o agendamento — fricção alta e risco de conversão baixo (registrado como risco em `design.md`).

Com o **Twilio for WhatsApp API**, o **sistema envia automaticamente** uma mensagem de confirmação para o WhatsApp do cliente assim que o agendamento é registrado. Isso elimina a dependência de ação do cliente e profissionaliza o fluxo.

---

## Feature: Envio Automático de Confirmação ao Cliente

Para que o cliente receba uma confirmação imediata e sem atrito  
Como o sistema da **Marlon Barber Shop**  
Eu quero disparar automaticamente uma mensagem de WhatsApp ao cliente via Twilio após o agendamento

---

### Scenario: Agendamento realizado com sucesso → cliente recebe WhatsApp

- **GIVEN** que o cliente preencheu Nome, WhatsApp, escolheu Serviço e Horário
- **WHEN** o frontend envia `POST /api/agendamentos` ao backend com os dados
- **THEN** o FastAPI salva o `Agendamento` no banco com status `PENDENTE`
- **AND** o backend chama o SDK do Twilio via `client.messages.create()`
- **AND** o cliente recebe no WhatsApp a mensagem de confirmação formatada
- **AND** o frontend recebe resposta de sucesso e exibe a tela de "Agendamento Registrado"

---

### Scenario: Falha na chamada ao Twilio (API indisponível)

- **GIVEN** que o agendamento foi salvo no banco com sucesso
- **WHEN** a chamada ao Twilio falha (ex: timeout ou credenciais inválidas)
- **THEN** o agendamento permanece salvo (NÃO deve ser desfeito)
- **AND** o erro é logado no servidor
- **AND** o frontend ainda mostra a tela de sucesso ao cliente
- **AND** o barbeiro pode ver o agendamento `PENDENTE` no dashboard e entrar em contato manualmente

---

### Scenario: Número de WhatsApp inválido

- **GIVEN** que o cliente informou um número de telefone com formato inválido (ex: menos de 10 dígitos)
- **WHEN** tenta submeter o formulário
- **THEN** a validação no frontend (React Hook Form + Zod) bloqueia o envio
- **AND** exibe: "Informe um número de WhatsApp válido (com DDD)"

---

## Formato da Mensagem de Confirmação

A mensagem enviada pelo Twilio ao WhatsApp do cliente deve seguir o template:

```
Olá, {nome_cliente}! 👋

Seu agendamento na *Marlon Barber Shop* foi registrado com sucesso!

✂️ Serviço: {nome_servico}
📅 Data: {data_formatada}
🕐 Horário: {hora_formatada}

Qualquer dúvida, responda esta mensagem. Te esperamos! 💈
```

---

## Arquitetura Técnica

### Backend (FastAPI)

```python
# Dependência: pip install twilio
from twilio.rest import Client

def enviar_confirmacao_whatsapp(telefone_cliente: str, dados: dict):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",  # ex: whatsapp:+14155238886
        to=f"whatsapp:+55{telefone_cliente}",
        body=f"Olá, {dados['nome']}! ..."
    )
```

### Variáveis de Ambiente Necessárias

| Variável | Descrição |
|---|---|
| `TWILIO_ACCOUNT_SID` | SID da conta Twilio (painel twilio.com) |
| `TWILIO_AUTH_TOKEN` | Token de autenticação |
| `TWILIO_WHATSAPP_NUMBER` | Número Twilio habilitado para WhatsApp (Sandbox ou produção) |

### Fluxo de Integração

```
Cliente → POST /api/agendamentos
              │
              ▼
        FastAPI salva no banco (SQLite)
              │
              ▼
        Chama Twilio SDK (background / sync)
              │
              ├── ✅ Sucesso → loga e retorna 201
              └── ❌ Falha  → loga o erro, ainda retorna 201
                             (agendamento não é desfeito)
```

---

## Ambiente de Desenvolvimento (Sandbox)

Durante o desenvolvimento do MVP, o Twilio oferece um **WhatsApp Sandbox gratuito**:
1. Acesse [console.twilio.com](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
2. O cliente/tester precisa enviar `join <palavra>` para o número sandbox para participar
3. Não requer aprovação de template para o sandbox

> **Para produção:** O número precisa ser aprovado pela Meta/Twilio e os templates de mensagem precisam de aprovação prévia (fora do escopo do MVP de 60h).
