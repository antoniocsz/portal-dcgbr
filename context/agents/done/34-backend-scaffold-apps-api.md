# 34 — Backend: scaffold do `apps/api` (Fastify + workspace)

## Agente: `agente-backend`
## Módulo: `apps/api` (novo) + infra

## Descrição
Criar o app `apps/api` (Node + Fastify) como base da API separada (ADR-007):
package.json, tsconfig, bootstrap do servidor e `GET /health` → 200. Esqueleto de
plugins (error handler, CORS placeholder). Ainda **sem rotas de domínio**.

## Escopo (arquivos que esta task vai tocar):
- `apps/api/package.json` (NOVO)
- `apps/api/tsconfig.json` (NOVO)
- `apps/api/src/index.ts` (NOVO)
- `apps/api/src/app.ts` (NOVO)
- `apps/api/src/plugins/error-handler.ts` (NOVO)
- `apps/api/.env.example` (NOVO)
- `turbo.json` (se precisar registrar env do app)
- `context/modules/api/status.md` (NOVO)
- `pnpm-lock.yaml` (via `pnpm install` — REQUER APROVAÇÃO PRÉVIA)

## Depende de: —
## Contexto para ler: `context/project/adr/ADR-007-backend-separado-do-frontend.md`, `apps/web/package.json` (padrão de scripts), `.agents/infra.md`
## Skills a carregar: codegen.md + backend.md + infra.md

## O que criar
- App Fastify com `HOST`/`PORT` por env (default `0.0.0.0:3001`).
- `GET /health` → `{ status: 'ok' }`.
- Bootstrap com logging e shutdown limpo (SIGTERM/SIGINT).
- Scripts: `dev` (tsx watch), `build`, `start`, `typecheck`, `lint`.

## Especificação
- Seguir `.agents/codegen.md`; TypeScript strict; sem lógica de domínio aqui.
- **NÃO** rodar `pnpm install` nem adicionar dependências sem aprovação explícita do usuário (guard rail).

## Critério de conclusão:
- [ ] `apps/api` sobe e `GET /health` responde 200
- [ ] typecheck + lint do novo app ok
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: criar/atualizar `context/modules/api/status.md`; `pnpm harness finish 34-backend-scaffold-apps-api`
## Complexidade: média
## Baseline (git)
- context/agents/queue/34-backend-scaffold-apps-api.md

## Baseline (git)
- context/modules/web/status.md
- context/project/overview.md
- context/project/stack.md
- context/agents/done/33-arch-separacao-backend-frontend.md
- context/agents/queue/34-backend-scaffold-apps-api.md
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
- context/project/adr/ADR-007-backend-separado-do-frontend.md
