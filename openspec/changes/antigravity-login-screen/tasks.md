## 1. Configuração da Paleta Antigravity no Tailwind

- [x] 1.1 Adicionar cores customizadas em `tailwind.config.ts`: `ag-dark` (#3E2522), `ag-sepia` (#8C6E63), `ag-cream` (#FFE0B2), `ag-beige` (#FFF2DF), `ag-gold` (#D3A376)
- [x] 1.2 Adicionar sombra customizada `shadow-neumorphic` em `tailwind.config.ts` com dois layers (clara e escura) para efeito de levitação

## 2. Componente PlanetIcon (SVG)

- [x] 2.1 Criar `frontend/src/components/login/PlanetIcon.tsx` com SVG inline de planeta estilizado com anéis (viewBox 0 0 200 200)
- [x] 2.2 Usar cores da paleta Antigravity no SVG: corpo do planeta em `ag-sepia`, anéis em `ag-gold` e `ag-beige`
- [x] 2.3 Adicionar padrões SVG sugerindo campos magnéticos/energia fluida nos anéis usando `ag-beige` com baixa opacidade

## 3. Componente BrandPanel (Painel Esquerdo)

- [x] 3.1 Criar `frontend/src/components/login/BrandPanel.tsx` com fundo `bg-ag-dark` (#3E2522)
- [x] 3.2 Renderizar `<PlanetIcon />` ao centro do painel
- [x] 3.3 Adicionar texto "A N T I G R A V I T Y" com `tracking-widest` e cor `text-ag-gold`
- [x] 3.4 Adicionar elementos decorativos flutuantes (esferas e linhas) em `ag-beige` com baixa opacidade para profundidade

## 4. Componente LoginForm (Painel Direito)

- [x] 4.1 Criar `frontend/src/components/login/LoginForm.tsx` com fundo gradiente a partir de `ag-cream` (#FFE0B2)
- [x] 4.2 Implementar campos "Username" e "Password" com estilo underline apenas (border-b) em `ag-beige`, rótulos em `ag-sepia`
- [x] 4.3 Implementar botão "Sign In" com contorno fino em `ag-gold`, texto `ag-gold`, padding ligeiramente maior
- [x] 4.4 Implementar botão "Sign Up" com contorno fino em `ag-gold`, texto `ag-gold`, tamanho menor que "Sign In"
- [x] 4.5 Adicionar link "Forgot Password?" abaixo dos botões em tom neutro da paleta
- [x] 4.6 Adicionar ícone de globo (Shadcn/UI ou SVG) no canto inferior do painel em tom neutro

## 5. Componente LoginPage (Cartão Flutuante)

- [x] 5.1 Criar `frontend/src/components/login/LoginPage.tsx` com fundo externo gradiente de `ag-beige` (#FFF2DF) a `ag-sepia` (#8C6E63)
- [x] 5.2 Compor cartão central com `<BrandPanel />` e `<LoginForm />` lado a lado, simétricos
- [x] 5.3 Aplicar `shadow-neumorphic` no cartão e centralizar com flexbox na tela inteira

## 6. Integração com Autenticação JWT

- [x] 6.1 Implementar `useState` para `username` e `password` em `LoginForm.tsx`
- [x] 6.2 Implementar handler `onSubmit` que chama o endpoint de autenticação JWT existente
- [x] 6.3 Armazenar token JWT retornado (localStorage ou cookie conforme padrão do projeto)
- [x] 6.4 Redirecionar para `/dashboard` em caso de sucesso usando `useRouter` do Next.js
- [x] 6.5 Exibir mensagem de erro no painel direito em caso de credenciais inválidas

## 7. Rota e Validação

- [x] 7.1 Criar/atualizar `frontend/src/app/login/page.tsx` para renderizar `<LoginPage />`
- [x] 7.2 Adicionar validação de campos obrigatórios antes do submit (username e password não vazios)
- [x] 7.3 Verificar contraste de acessibilidade dos textos sobre os fundos da paleta (WCAG AA mínimo)
- [x] 7.4 Testar visualmente o layout nos breakpoints desktop (1280px+)
