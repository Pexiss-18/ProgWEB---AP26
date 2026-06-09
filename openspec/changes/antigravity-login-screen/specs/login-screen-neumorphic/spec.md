## ADDED Requirements

### Requirement: Cartão de login flutuante com dois painéis
O sistema SHALL renderizar um cartão central dividido em dois painéis simétricos (esquerdo e direito) sobre um fundo com gradiente de #FFF2DF (topo) a #8C6E63 (base). O cartão SHALL ter sombra neumórfica suave que cria efeito visual de levitação.

#### Scenario: Exibição do cartão flutuante
- **WHEN** o usuário acessa a rota `/login`
- **THEN** o sistema exibe um cartão centralizado com dois painéis lado a lado sobre o fundo gradiente

#### Scenario: Sombra neumórfica visível
- **WHEN** o cartão é renderizado
- **THEN** o cartão apresenta sombra suave em dois layers (clara e escura) sem bordas duras, com aparência de levitação

---

### Requirement: Painel de marca (esquerdo) com tema Antigravidade
O painel esquerdo SHALL ter fundo #3E2522 (café escuro) e exibir: (1) ícone SVG de planeta com anéis nos tons da paleta, (2) texto "A N T I G R A V I T Y" em maiúsculas espaçadas na cor #D3A376, (3) elementos decorativos flutuantes (esferas e linhas) em #FFF2DF sugerindo antigravidade.

#### Scenario: Ícone de planeta exibido
- **WHEN** o painel esquerdo é renderizado
- **THEN** um ícone SVG de planeta estilizado com anéis é exibido ao centro do painel, usando tons #D3A376, #8C6E63 e #FFF2DF

#### Scenario: Texto de marca exibido
- **WHEN** o painel esquerdo é renderizado
- **THEN** o texto "A N T I G R A V I T Y" é exibido abaixo do ícone em letra espaçada (letter-spacing amplo), cor #D3A376

#### Scenario: Elementos decorativos presentes
- **WHEN** o painel esquerdo é renderizado
- **THEN** esferas e linhas sutis em #FFF2DF são visíveis ao redor do ícone, dando profundidade ao painel

---

### Requirement: Painel de formulário (direito) com campos minimalistas
O painel direito SHALL ter fundo em gradiente suave a partir de #FFE0B2 e exibir: campos "Username" e "Password" com apenas borda inferior em #FFF2DF e rótulos em #8C6E63; dois botões "Sign In" e "Sign Up" com contorno fino em #D3A376 e texto na mesma cor; link "Forgot Password?" abaixo dos botões; ícone de globo no canto inferior.

#### Scenario: Campos de formulário exibidos
- **WHEN** o painel direito é renderizado
- **THEN** dois campos de input (Username e Password) são exibidos com estilo underline apenas (sem bordas laterais ou superiores), rótulos em #8C6E63

#### Scenario: Password mascarado
- **WHEN** o usuário digita no campo Password
- **THEN** os caracteres são mascarados (type="password")

#### Scenario: Botão Sign In mais proeminente
- **WHEN** os botões são renderizados
- **THEN** o botão "Sign In" é exibido com padding ou tamanho ligeiramente maior que "Sign Up", ambos com bordas finas em #D3A376 e texto #D3A376

#### Scenario: Link Forgot Password exibido
- **WHEN** o painel direito é renderizado
- **THEN** o link "Forgot Password?" é exibido abaixo dos botões em tom neutro da paleta

#### Scenario: Ícone de globo no rodapé do painel
- **WHEN** o painel direito é renderizado
- **THEN** um ícone de globo estilizado é visível no canto inferior do painel em tom neutro da paleta

---

### Requirement: Submissão do formulário de login
O sistema SHALL enviar as credenciais (username e password) ao endpoint de autenticação JWT existente ao clicar em "Sign In" e redirecionar para o dashboard em caso de sucesso.

#### Scenario: Login bem-sucedido
- **WHEN** o usuário preenche username e password válidos e clica em "Sign In"
- **THEN** o sistema chama o endpoint de autenticação, armazena o token JWT e redireciona para `/dashboard`

#### Scenario: Login com credenciais inválidas
- **WHEN** o usuário fornece credenciais inválidas e clica em "Sign In"
- **THEN** o sistema exibe uma mensagem de erro no painel direito sem limpar os campos

#### Scenario: Campos obrigatórios vazios
- **WHEN** o usuário clica em "Sign In" com campos vazios
- **THEN** o sistema exibe validação nos campos antes de enviar a requisição
