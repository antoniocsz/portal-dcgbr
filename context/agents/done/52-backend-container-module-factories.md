# 52 — Backend: centralizar composição por módulo no `container.ts`

## Agente: `agente-backend`
## Módulo: `apps/api`

## Descrição
As tasks 38–42 montaram a composição (repositórios Prisma + `eventBus`) **inline**
nos arquivos de rota, porque `apps/api/src/container.ts` não expõe factories por
módulo. Extrair factories `contentDeps()/commentsDeps()/cardsDeps()/decksDeps()/tournamentsDeps()`
seguindo o padrão de `authDeps()/usersDeps()`, e atualizar as rotas para consumi-las.
**Sem mudança de contrato.**

## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/container.ts`
- `apps/api/src/routes/content.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/cards.ts`
- `apps/api/src/routes/decks.ts`
- `apps/api/src/routes/tournaments.ts`
- `context/modules/api/status.md`

## Depende de: `51-backend-fix-maxlen-content-route.md`
## Contexto para ler: `apps/api/src/container.ts`, `apps/api/src/routes/**`, `apps/web/src/app/api/**/_lib/container.ts` (referência)
## Skills a carregar: codegen.md + backend.md + architecture.md

## Critério de conclusão:
- [ ] Factories por módulo no `container.ts`; rotas consomem-nas (sem composição inline)
- [ ] Contratos inalterados; typecheck + lint + build `@digimon/app-api` ok
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: `pnpm harness finish 52-backend-container-module-factories`
## Complexidade: média
## Baseline (git)
- context/agents/queue/52-backend-container-module-factories.md

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/package.json
- apps/web/src/features/admin/model/admin-api.ts
- apps/web/src/features/admin/model/admin-decks-api.ts
- apps/web/src/features/admin/model/site-gate-api.ts
- apps/web/src/features/auth/model/auth-api.ts
- apps/web/src/features/cards/model/cards-api.ts
- apps/web/src/features/comments/model/comments-api.ts
- apps/web/src/features/content/model/api.ts
- apps/web/src/features/decks/model/decks-api.ts
- apps/web/src/features/tournaments/model/tournaments-api.ts
- apps/web/src/features/users/model/users-api.ts
- context/modules/auth/status.md
- context/modules/cards/status.md
- context/modules/comments/status.md
- context/modules/content/status.md
- context/modules/database/status.md
- context/modules/decks/status.md
- context/modules/tournaments/status.md
- context/modules/users/status.md
- context/modules/web/status.md
- context/project/deploy.md
- context/project/overview.md
- context/project/stack.md
- packages/api-client/src/index.ts
- packages/database/prisma/seed.ts
- pnpm-lock.yaml
- apps/api/.env.example
- apps/api/Dockerfile
- apps/api/docker-entrypoint.sh
- apps/api/package.json
- apps/api/src/app.ts
- apps/api/src/container.ts
- apps/api/src/http/cookies.ts
- apps/api/src/http/site-gate.ts
- apps/api/src/http/user-account-adapter.ts
- apps/api/src/index.ts
- apps/api/src/plugins/auth.ts
- apps/api/src/plugins/cors.ts
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
- apps/web/src/lib/api-base.ts
- context/agents/active/53-frontend-cutover-remover-handlers-web.md
- context/agents/done/33-arch-separacao-backend-frontend.md
- context/agents/done/34-backend-scaffold-apps-api.md
- context/agents/done/35-backend-mover-composition-root.md
- context/agents/done/36-backend-auth-routes.md
- context/agents/done/37-backend-users-routes.md
- context/agents/done/38-backend-content-routes.md
- context/agents/done/39-backend-comments-routes.md
- context/agents/done/40-backend-cards-routes.md
- context/agents/done/41-backend-decks-routes.md
- context/agents/done/42-backend-tournaments-routes.md
- context/agents/done/43-backend-cors-cookie-domain.md
- context/agents/done/44-backend-api-client.md
- context/agents/done/45-frontend-wire-api-client.md
- context/agents/done/46-backend-seed-only-if-empty.md
- context/agents/done/47-infra-api-dockerfile-entrypoint.md
- context/agents/done/51-backend-fix-maxlen-content-route.md
- context/agents/queue/48-infra-web-dockerfile-enxuto.md
- context/agents/queue/49-infra-deploy-coolify-2apps.md
- context/agents/queue/50-frontend-validacao-seo.md
- context/agents/queue/52-backend-container-module-factories.md
- context/modules/api-client/status.md
- context/modules/api/status.md
- context/project/adr/ADR-007-backend-separado-do-frontend.md
