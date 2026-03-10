# Tasks: Sistema de Barbearia (MVP 60h)

## 1. Setup da Infraestrutura e Repositórios
- [ ] 1.1 Inicializar projeto backend com FastAPI e SQLite (SQLAlchemy + Alembic).
- [ ] 1.2 Inicializar projeto frontend com Next.js (App Router), TailwindCSS e Shadcn/UI.
- [ ] 1.3 Configurar ambiente de testes no frontend (Vitest + Testing Library).

## 2. Backend: Modelo de Dados e API do Banco (FastAPI)
- [ ] 2.1 Criar os modelos SQLAlchemy: `Profissional`, `Servico` e `Agendamento`.
- [ ] 2.2 Criar pydantic schemas para validação de entrada/saída.
- [ ] 2.3 Implementar rota `GET /api/profissionais` (Listar barbeiros).
- [ ] 2.4 Implementar rota `GET /api/servicos` (Listar serviços e preços).
- [ ] 2.5 Implementar rota de Autenticação Admin (`POST /api/admin/login`) retornando JWT simples.

## 3. Backend: Motor de Agendamento (Regra de Negócio Crítica)
- [ ] 3.1 Implementar rota `GET /api/agendamentos/disponiveis`. Deve calcular os "slots" livres com base no horário de expediente padrão menos os agendamentos já existentes na data.
- [ ] 3.2 Implementar rota `POST /api/agendamentos` recebendo apenas (profissional_id, servico_id, data_hora_inicio, nome_cliente, telefone_cliente).
- [ ] 3.3 Garantir validação de colisão de horário no momento do `POST` (evitar double-booking).

## 4. Frontend: Visão do Cliente (Next.js)
- [ ] 4.1 Criar Home Page `/` listando os Profissionais e os Serviços disponíveis (consumindo API).
- [ ] 4.2 Criar fluxo de `/agendar/1` (Step 1: Selecionar Serviço).
- [ ] 4.3 Criar fluxo de `/agendar/2` (Step 2: Selecionar Data e mostrar Slots de horário).
- [ ] 4.4 Criar fluxo de `/agendar/3` (Step 3: Formulário rápido de Nome + WhatsApp).
- [ ] 4.5 Escrever testes no Vitest para garantir que o formulário de Agendamento bloqueia envios sem nome/telefone.

## 5. Integração e Confirmação (WhatsApp)
- [ ] 5.1 Criar a tela de Sucesso (`/agendar/sucesso`) que recebe os dados da reserva.
- [ ] 5.2 Implementar nela o botão "Confirmar via WhatsApp" gerando a URL dinâmica: `https://wa.me/{numero_barbearia}?text={mensagem_url_encoded}`.

## 6. Frontend: Visão do Admin (Dashboard)
- [ ] 6.1 Criar página de login `/admin/login` que consome a rota JWT do FastAPI.
- [ ] 6.2 Criar página privada `/admin/dashboard` que busca `GET /api/agendamentos?data=hoje`.
- [ ] 6.3 Construir a UI da agenda (Listagem ou Calendário simples) mostrando quem o barbeiro vai atender hoje.
