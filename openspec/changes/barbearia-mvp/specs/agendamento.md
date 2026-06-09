# Spec: Agendamento do Cliente

## Feature: Agendamento Rápido (Modo Visitante)

Para que o cliente consiga marcar um horário com o mínimo de atrito  
Como um cliente da **Marlon Barber Shop**  
Eu quero agendar um serviço sem precisar criar uma conta

---

### Scenario: Agendamento de serviço com sucesso e redirecionamento para o WhatsApp

- **GIVEN** que estou na página de agendamento (`/agendar`)
- **AND** selecionei o serviço "Corte" para o dia 20 de Outubro de 2025 às 10:00
- **WHEN** eu preencho meu nome com "Paulo" e meu WhatsApp com "11999990000" e clico em "Confirmar"
- **THEN** o sistema salva o agendamento no banco de dados com status `PENDENTE`
- **AND** redireciona ou exibe um botão `wa.me` com mensagem pré-preenchida: "Olá Marlon! Agendei um Corte para 20/10 às 10:00. Meu nome é Paulo."

---

### Scenario: Tentativa de agendamento com campos em branco

- **GIVEN** que estou no passo 3 do formulário de agendamento
- **WHEN** clico em "Confirmar" sem preencher o nome ou o WhatsApp
- **THEN** os campos obrigatórios ficam em estado de erro indicando o que está faltando
- **AND** o agendamento NÃO é salvo no banco

---

## Feature: Visualização de Horários Disponíveis

Para que eu saiba quando posso agendar  
Como um cliente da Marlon Barber Shop  
Eu quero ver apenas os horários que o barbeiro tem livres

---

### Scenario: Serviço de 1 slot (30 minutos)

- **GIVEN** que o barbeiro trabalha das 09:00 às 18:00
- **AND** já existe um agendamento às 10:00 com duração de 1 slot (30 min)
- **WHEN** eu seleciono um serviço de 30 minutos para o dia de hoje
- **THEN** o sistema exibe os slots 09:00, 09:30, 10:30, 11:00...
- **AND** NÃO exibe o slot 10:00

---

### Scenario: Serviço de 2 slots (60 minutos)

- **GIVEN** que já existe um agendamento às 10:30 com duração de 1 slot
- **WHEN** eu seleciono um serviço de 60 minutos (2 slots) para o mesmo dia
- **THEN** o slot 10:00 NÃO está disponível (pois 10:00 + 60m colide com o agendamento de 10:30)
- **AND** o slot 09:30 NÃO está disponível (pois 09:30 + 60m colide com o agendamento de 10:30)
- **AND** o slot 09:00 está disponível

---

### Scenario: Tentativa de agendamento em slot já ocupado (corrida simultânea)

- **GIVEN** que o slot 11:00 aparece disponível para dois usuários ao mesmo tempo
- **WHEN** ambos tentam confirmar o agendamento simultaneamente
- **THEN** apenas o primeiro a finalizar recebe confirmação
- **AND** o segundo recebe uma mensagem de erro: "Este horário acabou de ser reservado. Escolha outro."
