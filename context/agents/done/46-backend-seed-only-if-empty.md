# 46 — Backend: guard `--only-if-empty` no seed

## Agente: `agente-backend`
## Módulo: `database`

## Descrição
Adicionar ao `packages/database/prisma/seed.ts` o guard `--only-if-empty`: se o
banco já estiver populado, loga e sai 0 (bootstrap seguro — nunca sobrescreve banco
real). Mantém a idempotência atual.

## Escopo (arquivos que esta task vai tocar):
- `packages/database/prisma/seed.ts`
- `context/modules/database/status.md`

## Depende de: —
## Contexto para ler: `packages/database/prisma/seed.ts` (atual), `.agents/data.md`, padrão do projeto `diasbellazzi`
## Skills a carregar: codegen.md + backend.md + data.md

## Especificação
- `if (process.argv.includes('--only-if-empty'))` → checar a base (ex.: contar usuários/admin); se `> 0`, logar `Seed ignorado (banco já populado)` e **retornar** (exit 0).
- Sem a flag, comportamento atual inalterado.

## Critério de conclusão:
- [ ] Com banco populado + flag → loga "ignorado" e sai 0 (validado)
- [ ] Sem flag → comportamento atual
- [ ] typecheck ok; `pnpm harness check --barrel --db` ok

## Ao terminar: atualizar `context/modules/database/status.md`; `pnpm harness finish 46-backend-seed-only-if-empty`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/46-backend-seed-only-if-empty.md

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
- context/agents/active/44-backend-api-client.md
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
