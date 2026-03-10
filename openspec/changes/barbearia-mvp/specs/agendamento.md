# Specs: Sistema de Barbearia (MVP 60h)

## Features & Scenarios

### Feature: Agendamento Rápido (Modo Visitante)
Para que o cliente consiga marcar um horário com o mínimo de atrito
Como um cliente da barbearia
Eu quero agendar um serviço sem precisar criar uma conta

#### Scenario: Agendamento de serviço com sucesso e redirecionamento para o WhatsApp
- **GIVEN** que estou na página de agendamento do barbeiro "João"
- **AND** selecionei o serviço "Corte" para o dia 20 de Outubro às 10:00
- **WHEN** eu preencho meu nome com "Paulo" e meu WhatsApp com "1199999999" e clico em "Confirmar"
- **THEN** o sistema salva o agendamento no banco de dados com status "PENDENTE"
- **AND** a tela me redireciona ou exibe um botão de WhatsApp web (`wa.me`) com uma mensagem pré-preenchida de confirmação para eu enviar à barbearia.

### Feature: Visualização de Horários Disponíveis
Para que eu saiba quando posso agendar
Como um cliente da barbearia
Eu quero ver apenas os horários que o barbeiro tem livres

#### Scenario: Serviço de 1 slot de duração (ex: 30 minutos)
- **GIVEN** que o barbeiro "João" trabalha das 09:00 às 18:00
- **AND** o barbeiro "João" já tem um agendamento das 10:00 às 10:30
- **WHEN** eu seleciono um serviço de 30 minutos (1 slot) para o dia de hoje
- **THEN** o calendário deve me mostrar as opções 09:00, 09:30, 11:00 em diante
- **AND** NÃO deve mostrar a opção 10:00.

#### Scenario: Serviço de 2 slots de duração (ex: 60 minutos)
- **GIVEN** que o barbeiro "João" tem um agendamento marcado para as 10:30 (ocupando 1 slot)
- **WHEN** eu seleciono um serviço de 60 minutos (2 slots contíguos)
- **THEN** o calendário deve me mostrar as opções 09:00 e 09:30
- **AND** NÃO deve mostrar a opção 10:00 (pois 10:00 + 60m colidiria com o agendamento das 10:30).

### Feature: Dashboard do Administrador
Para que o gestor possa controlar o fluxo do salão
Como um dono da barbearia autenticado
Eu quero visualizar a agenda do dia

#### Scenario: Visualizando os clientes do dia
- **GIVEN** que eu fiz login com email e senha no `/admin/login`
- **WHEN** eu acesso a página `/admin/dashboard`
- **THEN** eu devo ver uma lista cronológica dos agendamentos do dia atual
- **AND** cada item da lista deve exibir o Horário, Nome do Cliente, Serviço e o botão de WhatsApp direto para falar com o cliente.
