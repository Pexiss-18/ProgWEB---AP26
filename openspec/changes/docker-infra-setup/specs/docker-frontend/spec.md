## ADDED Requirements

### Requirement: Dockerfile do Frontend
O projeto SHALL possuir um `Dockerfile` em `frontend/` usando multi-stage build com `node:20-alpine` que produza uma imagem de produção otimizada do Next.js com standalone output, servindo na porta 3000.

#### Scenario: Build multi-stage bem-sucedido
- **WHEN** o usuário executa `docker build -t frontend .` dentro da pasta `frontend/`
- **THEN** o build completa as etapas de instalação de dependências e `next build` sem erros, resultando em uma imagem de produção

#### Scenario: Next.js standalone output
- **WHEN** a imagem do frontend é construída
- **THEN** apenas os arquivos necessários para produção são incluídos (`.next/standalone`, `.next/static`, `public/`), sem `node_modules` de desenvolvimento

#### Scenario: Servidor de produção na porta 3000
- **WHEN** o container do frontend inicia
- **THEN** o Next.js serve a aplicação na porta 3000 usando o servidor Node.js standalone

#### Scenario: Comunicação com o backend
- **WHEN** a variável `NEXT_PUBLIC_API_URL` é configurada apontando para o serviço backend
- **THEN** as chamadas de API do frontend são roteadas corretamente para o backend containerizado
