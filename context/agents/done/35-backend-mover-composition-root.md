# 35 — Backend: portar composition root e camada HTTP para `apps/api`

## Agente: `agente-backend`
## Módulo: `apps/api` + `web`

## Descrição
Portar a composition root e os helpers HTTP de `apps/web/src/lib/server/**` para
`apps/api` (DIP preservado), adaptando de Next (route handlers) para Fastify
(plugins/hooks). Estabelecer as deps `@digimon/*` no `apps/api`. Pelo strangler, o
`apps/web` **mantém** suas cópias até a fase de handlers — não quebrar o portal.

## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/container.ts` (NOVO — porta de `apps/web/src/lib/server/container.ts`)
- `apps/api/src/http/**` (NOVO — porta de `http.ts`, `site-gate.ts`, `user-account-adapter.ts`)
- `apps/api/src/plugins/**` (NOVO — auth hook, erro, rate limit)
- `apps/api/package.json`
- `context/modules/api/status.md`

## Depende de: `34-backend-scaffold-apps-api.md`
## Contexto para ler: `apps/web/src/lib/server/**`, `packages/modules/*`, ADR-007
## Skills a carregar: codegen.md + backend.md + architecture.md

## O que criar
- Composition root em `apps/api` montando os use cases com as impls Prisma (DIP).
- Hooks Fastify: parse/verify de sessão (cookie ou bearer), erro uniforme (AppError → HTTP), rate limit (reuso de `InMemoryRateLimiter`).
- Helpers de cookie httpOnly (a topologia final do subdomínio fica na task 43).

## Especificação
- Mover/adaptar **sem alterar a lógica de domínio**; `apps/web` continua funcional.
- Não duplicar regra de negócio — só a camada de composição/HTTP.

## Critério de conclusão:
- [ ] `apps/api` compila com container + plugins
- [ ] typecheck + lint ok
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/api/status.md`; `pnpm harness finish 35-backend-mover-composition-root`
## Complexidade: média
## Baseline (git)
- context/agents/queue/35-backend-mover-composition-root.md

## Baseline (git)
- context/modules/web/status.md
- context/project/overview.md
- context/project/stack.md
- pnpm-lock.yaml
- apps/api/.env.example
- apps/api/package.json
- apps/api/src/app.ts
- apps/api/src/index.ts
- apps/api/src/plugins/error-handler.ts
- apps/api/tsconfig.json
- context/agents/done/33-arch-separacao-backend-frontend.md
- context/agents/done/34-backend-scaffold-apps-api.md
- context/agents/queue/35-backend-mover-composition-root.md
- context/agents/queue/36-backend-auth-routes.md
- context/agents/queue/37-backend-users-routes.md
- context/agents/queue/38-backend-content-routes.md
- context/agents/queue/39-backend-comments-routes.md
- context/agents/queue/40-backend-cards-routes.md
- context/agents/queue/41-backend-decks-routes.md
- context/agents/queue/42-backend-tournaments-routes.md
- context/agents/queue/43-backend-cors-cookie-domain.md
- context/agents/queue/44-backend-api-client.md
- context/agents/queue/45-frontend-wire-api-client.md
- context/agents/queue/46-backend-seed-only-if-empty.md
- context/agents/queue/47-infra-api-dockerfile-entrypoint.md
- context/agents/queue/48-infra-web-dockerfile-enxuto.md
- context/agents/queue/49-infra-deploy-coolify-2apps.md
- context/agents/queue/50-frontend-validacao-seo.md
- context/modules/api/status.md
- context/project/adr/ADR-007-backend-separado-do-frontend.md
