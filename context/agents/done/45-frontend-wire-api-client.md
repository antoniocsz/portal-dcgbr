# 45 — Frontend: usar `@digimon/api-client` nas features

## Agente: `agente-frontend`
## Módulo: `web`

## Descrição
Migrar `apps/web/src/features/*/model/api.ts` para usar `@digimon/api-client`, com
`baseUrl` de env (`NEXT_PUBLIC_API_URL` no browser / endereço interno no SSR) em vez
de URLs relativas `/api/...`.

## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/lib/api-base.ts`
- `apps/web/src/features/content/model/api.ts`
- `apps/web/src/features/auth/model/auth-api.ts`
- `apps/web/src/features/users/model/users-api.ts`
- `apps/web/src/features/comments/model/comments-api.ts`
- `apps/web/src/features/cards/model/cards-api.ts`
- `apps/web/src/features/decks/model/decks-api.ts`
- `apps/web/src/features/tournaments/model/tournaments-api.ts`
- `apps/web/src/features/admin/model/admin-api.ts`
- `apps/web/src/features/admin/model/admin-decks-api.ts`
- `apps/web/src/features/admin/model/site-gate-api.ts`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `pnpm-lock.yaml`
- `context/modules/web/status.md`

## Depende de: `44-backend-api-client.md`
## Contexto para ler: `features/content/model/api.ts` (padrão), ADR-007
## Skills a carregar: codegen.md + frontend.md

## Especificação
- MVVM estrito: só a camada Model muda; Views/ViewModels intocados.
- `baseUrl` público para o browser; interno (`http://api:3001`) para chamadas server-side.
- Manter os tipos e o formato de erro das features.
- **Estrutural (APROVADO):** adicionar `@digimon/api-client@workspace:*` em `apps/web/package.json` + `pnpm install`; ajustar `apps/web/next.config.ts` (`transpilePackages`) apenas se o build exigir.

## Critério de conclusão:
- [ ] Features chamam a API via `@digimon/api-client` (sem `/api` relativo hardcoded)
- [ ] typecheck + lint + build `@digimon/app-web` ok; `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/web/status.md`; `pnpm harness finish 45-frontend-wire-api-client`
## Complexidade: média
## Baseline (git)
- context/agents/queue/45-frontend-wire-api-client.md

## Baseline (git)
- context/modules/auth/status.md
- context/modules/cards/status.md
- context/modules/comments/status.md
- context/modules/content/status.md
- context/modules/database/status.md
- context/modules/decks/status.md
- context/modules/tournaments/status.md
- context/modules/users/status.md
- context/modules/web/status.md
- context/project/overview.md
- context/project/stack.md
- packages/api-client/src/index.ts
- packages/database/prisma/seed.ts
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
- context/agents/done/46-backend-seed-only-if-empty.md
- context/agents/queue/45-frontend-wire-api-client.md
- context/agents/queue/47-infra-api-dockerfile-entrypoint.md
- context/agents/queue/48-infra-web-dockerfile-enxuto.md
- context/agents/queue/49-infra-deploy-coolify-2apps.md
- context/agents/queue/50-frontend-validacao-seo.md
- context/agents/queue/51-backend-fix-maxlen-content-route.md
- context/agents/queue/52-backend-container-module-factories.md
- context/agents/queue/53-frontend-cutover-remover-handlers-web.md
- context/modules/api-client/status.md
- context/modules/api/status.md
- context/project/adr/ADR-007-backend-separado-do-frontend.md
