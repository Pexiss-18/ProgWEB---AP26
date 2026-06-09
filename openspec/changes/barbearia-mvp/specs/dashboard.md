# Spec: Dashboard do Administrador

## Feature: Visualização da Agenda do Dia

Para que o barbeiro Marlon possa organizar seu trabalho diário  
Como o administrador autenticado  
Eu quero ver a agenda do dia em formato de timeline clara e rápida

---

### Scenario: Visualizando os clientes do dia com agendamentos

- **GIVEN** que fiz login e estou em `/admin/dashboard`
- **WHEN** a página carrega para "hoje"
- **THEN** vejo uma timeline vertical das 09:00 às 18:00 com slots de 30 minutos
- **AND** cada slot ocupado exibe: Horário, Nome do Cliente, Serviço e um ícone de WhatsApp clicável
- **AND** slots livres aparecem com visual de "disponível" (linha vazia ou tracejada)

---

### Scenario: Dia sem nenhum agendamento

- **GIVEN** que o dia atual não possui agendamentos cadastrados
- **WHEN** a página carrega
- **THEN** a timeline aparece completamente livre
- **AND** exibe uma mensagem sutil: "Nenhum agendamento para hoje."

---

### Scenario: Resumo do dia no topo

- **GIVEN** que existem agendamentos para o dia
- **WHEN** a página carrega
- **THEN** o topo exibe estatísticas rápidas:
  - Total de clientes agendados
  - Total de slots ocupados vs. disponíveis
  - Receita projetada (soma dos preços dos serviços confirmados)

---

## Feature: Confirmar e Cancelar Agendamentos

Para que o barbeiro possa atualizar o status de cada cliente  
Como o administrador autenticado  
Eu quero marcar agendamentos como confirmados ou cancelados

---

### Scenario: Confirmando um agendamento pendente

- **GIVEN** que existe um agendamento com status `PENDENTE` na timeline
- **WHEN** o admin clica em "Confirmar" naquele card
- **THEN** o sistema atualiza o status para `CONFIRMADO` via `PATCH /api/admin/agendamentos/{id}/status`
- **AND** o card na timeline reflete visualmente o novo status (badge verde)

---

### Scenario: Cancelando um agendamento

- **GIVEN** que existe um agendamento na timeline (PENDENTE ou CONFIRMADO)
- **WHEN** o admin clica em "Cancelar" e confirma a ação no modal
- **THEN** o status muda para `CANCELADO`
- **AND** o slot volta a aparecer como "disponível" na timeline

---

### Scenario: Adicionando um agendamento manual (cliente walk-in)

- **GIVEN** que o admin está no dashboard
- **WHEN** clica no botão "+" (FAB) e preenche: Serviço, Horário, Nome e WhatsApp do cliente
- **AND** salva o registro
- **THEN** o agendamento é criado diretamente com status `CONFIRMADO` (sem WhatsApp)
- **AND** aparece imediatamente na timeline
