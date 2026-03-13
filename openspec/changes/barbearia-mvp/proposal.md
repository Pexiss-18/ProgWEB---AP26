# Proposal: Sistema de Barbearia (MVP 60h)

## Motivation

Este projeto faz parte de uma disciplina acadêmica de programação web com uma restrição severa de tempo (60 horas totais de desenvolvimento). O problema a ser resolvido é criar um sistema funcional de agendamento para barbearias focado em conversão rápida de clientes, sem criar fricções desnecessárias no processo de marcação.

A arquitetura escolhida foi separar o Frontend (Next.js) do Backend (FastAPI), permitindo exercitar conceitos de integração de APIs REST enquanto se constrói uma interface moderna com componentes Shadcn e TailwindCSS.

## Proposed Solution

A proposta é construir um Produto Mínimo Viável (MVP) contendo apenas o núcleo essencial de negócio: "Agenda + Clientes".

1. **Visão do Cliente (Mobile e Desktop)**: 
   - Acesso a um "cardápio digital" responsivo da barbearia listando serviços e horários disponíveis.
   - Fluxo de agendamento "Modo Visitante": sem exigência de criar senha ou conta; o cliente informa apenas Nome e WhatsApp no momento da confirmação.
   - Finalização do fluxo enviando o cliente para um deep link do WhatsApp (`wa.me`) pré-preenchido, criando um vínculo direto com o estabelecimento.

2. **Visão do Administrador (Desktop/Tablet)**:
   - Login seguro (manual).
   - Dashboard focada na visualização da agenda do dia ("Quem está agendado hoje?").
   - Gestão básica de clientes e serviços.

3. **Arquitetura Técnica (Simplificada para 60h)**:
   - **Lógica de Tempo**: Adoção de **Slots fixos de 30 minutos** na agenda. Em vez de calcular minutos exatos, o sistema aloca blocos padronizados. Ex: um serviço pode ocupar 1 slot (30m) ou 2 slots (1h).
   - **Banco de Dados (SQLite)**: Apenas 3 tabelas principais:
     - `Admin` (Email, hash de senha)
     - `Servico` (Nome, preço, duração em blocos)
     - `Agendamento` (Servico_id, Data/Hora, Status, Nome_Cliente, Telefone_Cliente)

## Impact

- **Frontend**: Criação de páginas em Next.js (App Router), integração com `ui/components` do Shadcn, configuração do Vitest para testes dos componentes críticos de agendamento.
- **Backend**: Criação de rotas REST no FastAPI (Python), mapeamento do banco com SQLAlchemy, e validação de dados via Pydantic.
- **Testes**: Foco na validação da regra de negócio dos "slots de horário" no backend e no comportamento do formulário de agendamento no react/vitest.
