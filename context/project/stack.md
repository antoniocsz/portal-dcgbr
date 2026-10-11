# Stack Técnica — digimon-card-game-brasil

> Decidida na context-interview (Bloco 6). Não multi-tenant. SEO-first. **Stack antiga `@saas` descartada.**

## Monorepo
- Turborepo + pnpm workspaces
- TypeScript strict
- ESLint flat config (lint + formatação via @stylistic)

## Frontend / Web (app único)
- **Next.js App Router** — SSR/ISR para conteúdo público (SEO-first, Core Web Vitals)
- **Tailwind CSS** + **shadcn/ui** (base-ui)
- Responsivo + PWA (sem app nativo)
- **Frontend puro** (`apps/web`): não acessa banco nem expõe `/api/**` (ADR-007)
- Painel admin integrado no mesmo app (rotas `/admin/*` protegidas por role)
- Domínio do portal: `digimoncardgamebrasil.com.br` (público + admin)

## Backend
- **API separada em `apps/api`** — Node + **Fastify** (ADR-007), consumindo `packages/modules/*` + `packages/database`
- **Zod** para validação
- **Auth própria** — JWT (access + refresh rotation), Member gratuito (sem pagamento)
- Exposição: subdomínio `api.digimoncardgamebrasil.com.br`; CORS + cookies httpOnly com `Domain` (ADR-007)
- Migrations + seed no entrypoint do container (`migrate deploy` + seed `--only-if-empty`) (ADR-007)

## Banco / Dados
- **Postgres + Prisma**
- Busca via **full-text** do Postgres
- Sem Redis por enquanto (apenas Postgres)
- Sem cache externo dedicado na v1 (cache em memória/ISR do Next.js)

## Infraestrutura
- Deploy: **Coolify + Dockerfile** — dois apps: `apps/api` (Node) + `apps/web` (Next standalone)
- Domínios: `digimoncardgamebrasil.com.br` (web) e `api.digimoncardgamebrasil.com.br` (API)

## Módulos (escopo `@digimon`)
- `@digimon/content` (inclui categoria Simuladores) · `@digimon/cards` · `@digimon/decks` · `@digimon/tournaments`
- `@digimon/users` · `@digimon/auth` · `@digimon/comments`
- `@digimon/contracts` (tipos/erros/eventos/EventBus — cola entre módulos)