# Spec: Autenticação do Administrador

## Feature: Login do Barbeiro (Admin)

Para que o dono da barbearia possa acessar a agenda protegida  
Como o **barbeiro Marlon** (único administrador do sistema)  
Eu quero fazer login com e-mail e senha e acessar o painel privado

---

### Scenario: Login com credenciais corretas

- **GIVEN** que estou na página `/admin/login`
- **WHEN** eu insiro um e-mail e senha cadastrados corretamente e clico em "Entrar"
- **THEN** o sistema valida as credenciais via `POST /api/admin/login`
- **AND** recebo um token JWT armazenado (cookie HttpOnly ou localStorage)
- **AND** sou redirecionado para `/admin/dashboard`

---

### Scenario: Login com credenciais incorretas

- **GIVEN** que estou na página `/admin/login`
- **WHEN** insiro um e-mail ou senha incorretos e clico em "Entrar"
- **THEN** o sistema responde com status 401
- **AND** a tela exibe a mensagem de erro: "E-mail ou senha incorretos."
- **AND** permaneço na página de login

---

### Scenario: Acesso não autorizado a rota protegida

- **GIVEN** que não estou autenticado
- **WHEN** tento acessar `/admin/dashboard` diretamente pela URL
- **THEN** o sistema me redireciona automaticamente para `/admin/login`

---

### Scenario: Logout do sistema

- **GIVEN** que estou autenticado e dentro do `/admin/dashboard`
- **WHEN** clico em "Sair" na interface
- **THEN** o token JWT é invalidado/removido
- **AND** sou redirecionado para `/admin/login`

---

## Regras de Negócio

- Apenas **uma conta de administrador** existe no banco de dados (tabela `Admin`).
- A senha é armazenada como hash seguro (bcrypt).
- O token JWT deve expirar em **8 horas** por padrão (correspondendo a um turno de trabalho).
- Não existe fluxo de "Esqueci minha senha" no MVP — reset é feito manualmente no banco.
