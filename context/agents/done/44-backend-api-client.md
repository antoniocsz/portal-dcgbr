# 44 — API client: baseUrl + credentials (e remover tenantId)

## Agente: `agente-backend`
## Módulo: `packages/api-client`

## Descrição
Evoluir `@digimon/api-client` (hoje morto, herdado do @saas) para o cliente único
do web: `baseUrl` configurável (público no browser / interno no SSR),
`credentials: 'include'` e remoção do `tenantId` (não multi-tenant).

## Escopo (arquivos que esta task vai tocar):
- `packages/api-client/src/index.ts`
- `packages/api-client/package.json` (se necessário)
- `context/modules/api-client/status.md` (se existir; senão, criar)

## Depende de: `35-backend-mover-composition-root.md`
## Contexto para ler: `packages/api-client/src/index.ts`, ADR-007, `packages/contracts`
## Skills a carregar: codegen.md + backend.md

## Especificação
- `createApiClient({ baseUrl })`; GET/POST/PATCH/DELETE com JSON.
- `credentials: 'include'` por padrão (cookie de sessão cross-origin).
- Remover `tenantId`/`x-tenant-id`.
- Erro tipado (`ApiError`) compatível com os `ApiError` das features.

## Critério de conclusão:
- [ ] `@digimon/api-client` sem `tenantId`; `credentials: 'include'`
- [ ] typecheck ok; `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar status; `pnpm harness finish 44-backend-api-client`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/44-backend-api-client.md

## Baseline (git)
- context/modules/auth/status.md
- context/modules/cards/status.md
- context/modules/comments/status.md
- context/modules/content/status.md
- context/modules/decks/status.md
- context/modules/tournaments/status.md
- context/modules/users/status.md
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
- context/agents/active/43-backend-cors-cookie-domain.md
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
- context/agents/queue/44-backend-api-client.md
- context/agents/queue/45-frontend-wire-api-client.md
- context/agents/queue/46-backend-seed-only-if-empty.md
- context/agents/queue/47-infra-api-dockerfile-entrypoint.md
- context/agents/queue/48-infra-web-dockerfile-enxuto.md
- context/agents/queue/49-infra-deploy-coolify-2apps.md
- context/agents/queue/50-frontend-validacao-seo.md
- context/agents/queue/51-backend-fix-maxlen-content-route.md
- context/agents/queue/52-backend-container-module-factories.md
- context/modules/api/status.md
- context/project/adr/ADR-007-backend-separado-do-frontend.md
