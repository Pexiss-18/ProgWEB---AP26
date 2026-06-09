## Context

A tela de login existente é funcional mas genérica. O sistema de agendamento de serviços precisa de uma identidade visual forte para transmitir profissionalismo ao administrador desde o primeiro acesso. A paleta "Antigravity" (tons café, creme e bege dourado) já está definida como identidade da marca. A stack frontend é Next.js + TypeScript + TailwindCSS + Shadcn/UI.

## Goals / Non-Goals

**Goals:**
- Implementar o layout de dois painéis com cartão flutuante neumórfico
- Definir e configurar a paleta Antigravity no TailwindCSS
- Criar componentes React reutilizáveis: `PlanetIcon`, `BrandPanel`, `LoginForm`, `LoginPage`
- Garantir acessibilidade mínima (contraste adequado, labels nos campos)
- Manter compatibilidade com os endpoints de autenticação JWT existentes no backend FastAPI

**Non-Goals:**
- Alterações no backend ou nos endpoints de autenticação
- Responsividade mobile (foco inicial em desktop)
- Animações complexas além das sugeridas no design (campos magnéticos são decorativos/CSS estático ou SVG simples)
- Dark/light mode toggle

## Decisions

### 1. Paleta de cores via Tailwind `extend`
**Decisão**: Adicionar as cores Antigravity em `tailwind.config.ts` no bloco `extend.colors`, não sobrescrever as defaults.
**Rationale**: Permite usar as cores como classes utilitárias (`bg-ag-dark`, `text-ag-gold`) sem perder as utilities padrão do Tailwind que outros componentes já usam.
**Alternativa considerada**: CSS custom properties globais — rejeitada por criar inconsistência com o padrão do projeto (TailwindCSS).

### 2. Sombra neumórfica via Tailwind `boxShadow` customizado
**Decisão**: Definir `shadow-neumorphic` no `tailwind.config.ts` com dois layers de sombra (clara e escura) para simular elevação suave.
**Rationale**: Encapsula a regra complexa de box-shadow em uma única classe reutilizável, evitando inline styles.
**Alternativa considerada**: `style={{ boxShadow: '...' }}` inline — rejeitada por dificultar manutenção.

### 3. Ícone de planeta como componente SVG inline
**Decisão**: `PlanetIcon` será um componente React com SVG inline, não um arquivo de imagem.
**Rationale**: SVG inline permite colorização dinâmica via props/TailwindCSS e não depende de assets externos. Tamanho é negligível.
**Alternativa considerada**: PNG/WebP estático — rejeitada por inflexibilidade de cores e resolução.

### 4. Estrutura de componentes
```
frontend/src/
  components/
    login/
      LoginPage.tsx       ← página completa (dois painéis + fundo)
      BrandPanel.tsx      ← painel esquerdo (planeta, texto, esferas)
      LoginForm.tsx       ← painel direito (formulário)
      PlanetIcon.tsx      ← SVG do planeta com anéis
  app/
    login/
      page.tsx            ← rota Next.js, renderiza <LoginPage />
```
**Rationale**: Separação de responsabilidades clara; componentes testáveis individualmente.

### 5. Formulário usa estado local (useState) sem lib de formulário
**Decisão**: Estado local simples com `useState` para username/password; submit chama o endpoint JWT existente.
**Rationale**: Formulário tem apenas 2 campos — overhead de react-hook-form ou Formik não se justifica.

## Risks / Trade-offs

- **[Contraste de acessibilidade]** → Os tons bege/creme sobre fundo claro podem não atingir WCAG AA. **Mitigação**: usar `text-ag-dark` (#3E2522) para labels e validar com ferramenta de contraste antes do merge.
- **[Soft-neumorphism e temas futuros]** → Sombras neumórficas dependem fortemente da cor de fundo; se a paleta mudar, o efeito quebra. **Mitigação**: documentar a dependência nos comentários do config; aceitar como trade-off consciente do estilo.
- **[SVG do planeta artesanal]** → Pode demandar ajuste fino de coordenadas SVG. **Mitigação**: usar viewBox padronizado (0 0 200 200) e testar visualmente em diferentes tamanhos de tela.
