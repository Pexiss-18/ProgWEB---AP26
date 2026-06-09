# Spec: Gestão de Serviços

## Feature: Listagem de Serviços para o Cliente

Para que o cliente saiba o que pode contratar  
Como um cliente da Marlon Barber Shop  
Eu quero ver os serviços disponíveis com preço e duração antes de agendar

---

### Scenario: Exibição dos serviços disponíveis

- **GIVEN** que estou na tela inicial do sistema (`/`)
- **WHEN** a página carrega
- **THEN** vejo uma lista dos serviços cadastrados pelo barbeiro
- **AND** cada serviço exibe: Nome, Preço (R$) e Duração (em minutos)

---

### Scenario: Nenhum serviço cadastrado

- **GIVEN** que o banco de dados não possui serviços cadastrados
- **WHEN** a página carrega
- **THEN** a interface exibe uma mensagem amigável: "Serviços em breve. Entre em contato pelo WhatsApp."

---

## Feature: Gestão de Serviços pelo Admin

Para que o dono da barbearia possa manter a lista de serviços atualizada  
Como o administrador autenticado  
Eu quero criar, editar e remover serviços

---

### Scenario: Criação de um novo serviço

- **GIVEN** que estou autenticado em `/admin/dashboard`
- **WHEN** acesso a área de Serviços e preencho: Nome="Corte", Preço=50.00, Duração=1 slot (30min)
- **AND** clico em Salvar
- **THEN** o sistema cria o serviço via `POST /api/admin/servicos`
- **AND** o serviço aparece imediatamente na listagem pública

---

### Scenario: Edição de um serviço existente

- **GIVEN** que existe o serviço "Barba" cadastrado com preço R$40
- **WHEN** o admin edita o preço para R$45 e salva
- **THEN** o sistema atualiza via `PUT /api/admin/servicos/{id}`
- **AND** a listagem pública passa a exibir o novo preço

---

### Scenario: Remoção de um serviço com agendamentos futuros

- **GIVEN** que o serviço "Combo" tem agendamentos futuros confirmados
- **WHEN** o admin tenta remover o serviço
- **THEN** o sistema exibe um aviso: "Este serviço possui agendamentos futuros. Confirma a remoção?"
- **AND** se confirmado, o serviço é marcado como inativo mas os agendamentos existentes são preservados

---

## Modelo de Dados

```
Servico:
  id          int (PK)
  nome        string   — ex: "Corte", "Barba", "Combo"
  preco       float    — ex: 50.00
  slot_size   int      — número de blocos de 30min (1 = 30min, 2 = 1h)
  ativo       bool     — controla visibilidade pública
```
