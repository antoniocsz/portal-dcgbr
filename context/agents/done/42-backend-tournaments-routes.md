# 42 — Backend: rotas de tournaments no `apps/api`

## Agente: `agente-backend`
## Módulo: `apps/api` + `tournaments`

## Descrição
Portar os route handlers de torneios (`apps/web/src/app/api/tournaments/**`) para
rotas Fastify em `apps/api`, reusando `@digimon/tournaments`.

## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/tournaments.ts`
- `context/modules/tournaments/status.md`

## Depende de: `36-backend-auth-routes.md`
## Contexto para ler: `apps/web/src/app/api/tournaments/**`, ADR-007
## Skills a carregar: codegen.md + backend.md + authorization.md

## Rotas
- `GET/POST /tournaments`, `GET/PATCH/DELETE /tournaments/:slug`, `POST /tournaments/:slug/results`

## Especificação
- Mesmos contratos (collaborative Member publish); erros via `AppError`.

## Critério de conclusão:
- [ ] Contratos idênticos; typecheck + lint ok; `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/tournaments/status.md`; `pnpm harness finish 42-backend-tournaments-routes`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/42-backend-tournaments-routes.md

## Baseline (git)
- context/modules/auth/status.md
- context/modules/web/status.md
- context/project/overview.md
- context/project/stack.md
- pnpm-lock.yaml
- apps/api/.env.example
- apps/api/package.json
- apps/api/src/app.ts
- apps/api/src/container.ts
- apps/api/src/http/cookies.ts
- apps/api/src/http/site-gate.ts
- apps/api/src/http/user-account-adapter.ts
- apps/api/src/index.ts
- apps/api/src/plugins/auth.ts
- apps/api/src/plugins/error-handler.ts
- apps/api/src/plugins/rate-limit.ts
- apps/api/src/routes/auth.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/comments.ts
- apps/api/src/routes/content.ts
- apps/api/src/routes/decks.ts
- apps/api/src/routes/index.ts
- apps/api/src/routes/settings.ts
- apps/api/src/routes/tournaments.ts
- apps/api/src/routes/users.ts
- apps/api/tsconfig.json
- context/agents/active/37-backend-users-routes.md
- context/agents/active/38-backend-content-routes.md
- context/agents/active/39-backend-comments-routes.md
- context/agents/active/40-backend-cards-routes.md
- context/agents/active/41-backend-decks-routes.md
- context/agents/done/33-arch-separacao-backend-frontend.md
- context/agents/done/34-backend-scaffold-apps-api.md
- context/agents/done/35-backend-mover-composition-root.md
- context/agents/done/36-backend-auth-routes.md
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
