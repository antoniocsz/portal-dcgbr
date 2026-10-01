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
- Painel admin integrado no mesmo app (rotas `/admin/*` protegidas por role)
- Domínio único: `digimoncardgamebrasil.com.br`

## Backend
- **Route Handlers + Server Actions** no Next.js (Hono.js como opção para casos específicos)
- **Zod** para validação
- **Auth própria** — JWT (access + refresh rotation), Member gratuito (sem pagamento)

## Banco / Dados
- **Postgres + Prisma**
- Busca via **full-text** do Postgres
- Sem Redis por enquanto (apenas Postgres)
- Sem cache externo dedicado na v1 (cache em memória/ISR do Next.js)

## Infraestrutura
- Deploy: **Coolify + Dockerfile**
- Domínio único, sem subdomínios

## Módulos (escopo `@digimon`)
- `@digimon/content` (inclui categoria Simuladores) · `@digimon/cards` · `@digimon/decks` · `@digimon/tournaments`
- `@digimon/users` · `@digimon/auth` · `@digimon/comments`
- `@digimon/contracts` (tipos/erros/eventos/EventBus — cola entre módulos)