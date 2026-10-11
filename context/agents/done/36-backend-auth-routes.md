# 36 — Backend: rotas de auth no `apps/api`

## Agente: `agente-backend`
## Módulo: `apps/api` + `auth`

## Descrição
Portar os route handlers de auth (`apps/web/src/app/api/auth/**`) para rotas
Fastify em `apps/api`, reusando os use cases de `@digimon/auth` (contratos JSON
idênticos).

Esta task também **estabelece o registro de rotas** (`routes/index.ts` + stubs por
módulo + wiring em `app.ts`), destravando as tasks 37–42 em paralelo — cada uma
preenche só o seu próprio stub, sem editar arquivo compartilhado.

## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/index.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/users.ts`
- `apps/api/src/routes/content.ts`
- `apps/api/src/routes/settings.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/cards.ts`
- `apps/api/src/routes/decks.ts`
- `apps/api/src/routes/tournaments.ts`
- `apps/api/src/app.ts`
- `context/modules/api/status.md`
- `context/modules/auth/status.md`

## Depende de: `35-backend-mover-composition-root.md`
## Contexto para ler: `apps/web/src/app/api/auth/**`, ADR-002, ADR-007
## Skills a carregar: codegen.md + backend.md + authorization.md + security.md

## Rotas
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /auth/me` (sessão atual ou `{ user: null }`)

## Especificação
- Mesmos contratos de request/response e erros (`AppError`).
- Cookie httpOnly (a topologia cross-origin final é a task 43).
- Rate limit de registro preservado.

## Critério de conclusão:
- [ ] Contratos idênticos aos handlers atuais (login/refresh/me/register/forgot/reset/logout)
- [ ] typecheck + lint ok; `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/auth/status.md`; `pnpm harness finish 36-backend-auth-routes`
## Complexidade: média
## Baseline (git)
- context/agents/queue/36-backend-auth-routes.md

## Baseline (git)
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
- apps/api/tsconfig.json
- context/agents/done/33-arch-separacao-backend-frontend.md
- context/agents/done/34-backend-scaffold-apps-api.md
- context/agents/done/35-backend-mover-composition-root.md
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
