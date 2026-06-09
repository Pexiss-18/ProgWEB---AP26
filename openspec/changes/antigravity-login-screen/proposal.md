## Why

A tela de login atual carece de identidade visual e não transmite a sofisticação esperada para um sistema de agendamento premium. A oportunidade é criar uma primeira impressão marcante, alinhada à paleta "Antigravity", com estética soft-neumorphic que reforça confiança e modernidade desde o primeiro acesso.

## What Changes

- Substituição completa do layout da tela de login por um cartão central flutuante de dois painéis simétricos
- Implementação da paleta de cores "Antigravity" (tons café escuro, creme e bege dourado) em toda a tela
- Painel esquerdo com identidade de marca: ícone de planeta estilizado, nome "A N T I G R A V I T Y" e elementos flutuantes decorativos
- Painel direito com formulário minimalista: campos Username e Password com estilo underline, botões "Sign In" e "Sign Up" com bordas finas em #D3A376, link "Forgot Password?" e ícone de globo
- Aplicação de sombra neumórfica no cartão para efeito de levitação
- Fundo externo com gradiente de bege claro (#FFF2DF) a marrom sépia (#8C6E63)

## Capabilities

### New Capabilities

- `login-screen-neumorphic`: Tela de login/splash com design soft-neumorphic, paleta Antigravity, painel de marca e formulário de autenticação

### Modified Capabilities

_(nenhuma)_

## Impact

- **Frontend**: Componente de página de login em Next.js com TailwindCSS — novo componente `LoginPage` e subcomponentes (`BrandPanel`, `LoginForm`, `PlanetIcon`)
- **Estilo**: Configuração de cores customizadas no `tailwind.config` para a paleta Antigravity
- **Sem impacto no backend**: mudança puramente visual/frontend; os endpoints de autenticação JWT existentes permanecem inalterados
