# 55 — Infra: atualizar .env.example (API + web)

## Agente: `agente-backend`
## Módulo: `web`

## Descrição
Alinhar os `.env.example` à topologia de 2 apps (ADR-007):
- `apps/web/.env.example`: trocar `DATABASE_URL` por `NEXT_PUBLIC_API_URL` (browser)
  e `API_INTERNAL_URL` (SSR); manter `JWT_SECRET` (usado server-side, ex. sessão admin).
- `apps/api/.env.example`: incluir `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
  `COOKIE_DOMAIN`, `SKIP_SEED`, `HOST`, `PORT`.
(Reportado pela task 49.)

## Escopo (arquivos que esta task vai tocar):
- `apps/web/.env.example`
- `apps/api/.env.example`

## Depende de: `49-infra-deploy-coolify-2apps.md`
## Contexto para ler: `context/project/deploy.md`, ADR-007
## Skills a carregar: infra.md

## Critério de conclusão:
- [ ] `.env.example` do web e da API refletem as envs reais de cada app
- [ ] `pnpm harness check --barrel --db` ok

## Ao terminar: `pnpm harness finish 55-infra-env-examples`
## Complexidade: baixa
## Baseline (git)
- context/agents/queue/55-infra-env-examples.md

## Baseline (git)
- README.md
- apps/web/Dockerfile
- apps/web/next-env.d.ts
- apps/web/package.json
- apps/web/src/app/(public)/cartas/[id]/page.tsx
- apps/web/src/app/(public)/noticias/[slug]/page.tsx
- apps/web/src/app/admin/configuracoes/page.tsx
- apps/web/src/app/admin/layout.tsx
- apps/web/src/app/api/admin/decks/[slug]/route.ts
- apps/web/src/app/api/admin/decks/route.ts
- apps/web/src/app/api/auth/forgot-password/route.ts
- apps/web/src/app/api/auth/login/route.ts
- apps/web/src/app/api/auth/logout/route.ts
- apps/web/src/app/api/auth/me/route.ts
- apps/web/src/app/api/auth/refresh/route.ts
- apps/web/src/app/api/auth/register/route.ts
- apps/web/src/app/api/auth/reset-password/route.ts
- apps/web/src/app/api/cards/[id]/route.ts
- apps/web/src/app/api/cards/_lib/container.ts
- apps/web/src/app/api/cards/_lib/handlers.ts
- apps/web/src/app/api/cards/_lib/serialize.ts
- apps/web/src/app/api/cards/_lib/session.ts
- apps/web/src/app/api/cards/admin/import/route.ts
- apps/web/src/app/api/cards/route.ts
- apps/web/src/app/api/cards/sets/route.ts
- apps/web/src/app/api/comments/[id]/moderate/route.ts
- apps/web/src/app/api/comments/[id]/route.ts
- apps/web/src/app/api/comments/_lib/container.ts
- apps/web/src/app/api/comments/_lib/http.ts
- apps/web/src/app/api/comments/_lib/session.ts
- apps/web/src/app/api/comments/admin/route.ts
- apps/web/src/app/api/comments/route.ts
- apps/web/src/app/api/decks/[slug]/copy/route.ts
- apps/web/src/app/api/decks/[slug]/publish/route.ts
- apps/web/src/app/api/decks/[slug]/route.ts
- apps/web/src/app/api/decks/_lib/card-reference-validator.ts
- apps/web/src/app/api/decks/_lib/container.ts
- apps/web/src/app/api/decks/_lib/handlers.ts
- apps/web/src/app/api/decks/_lib/serialize.ts
- apps/web/src/app/api/decks/_lib/session.ts
- apps/web/src/app/api/decks/route.ts
- apps/web/src/app/api/posts/[slug]/route.ts
- apps/web/src/app/api/posts/_lib/authors.ts
- apps/web/src/app/api/posts/_lib/handlers.ts
- apps/web/src/app/api/posts/_lib/serialize.ts
- apps/web/src/app/api/posts/_lib/session.ts
- apps/web/src/app/api/posts/_lib/use-cases.ts
- apps/web/src/app/api/posts/admin/[id]/_lib/get-post-by-id.ts
- apps/web/src/app/api/posts/admin/[id]/archive/route.ts
- apps/web/src/app/api/posts/admin/[id]/publish/route.ts
- apps/web/src/app/api/posts/admin/[id]/route.ts
- apps/web/src/app/api/posts/admin/[id]/submit/route.ts
- apps/web/src/app/api/posts/admin/route.ts
- apps/web/src/app/api/posts/route.ts
- apps/web/src/app/api/posts/simulators/route.ts
- apps/web/src/app/api/settings/site-gate/route.ts
- apps/web/src/app/api/tournaments/[slug]/results/route.ts
- apps/web/src/app/api/tournaments/[slug]/route.ts
- apps/web/src/app/api/tournaments/_lib/container.ts
- apps/web/src/app/api/tournaments/_lib/handlers.ts
- apps/web/src/app/api/tournaments/_lib/serialize.ts
- apps/web/src/app/api/tournaments/_lib/session.ts
- apps/web/src/app/api/tournaments/route.ts
- apps/web/src/app/api/users/[id]/role/route.ts
- apps/web/src/app/api/users/[id]/status/route.ts
- apps/web/src/app/api/users/me/route.ts
- apps/web/src/app/api/users/route.ts
- apps/web/src/components/admin/logout-button.tsx
- apps/web/src/components/user-menu.tsx
- apps/web/src/features/admin/model/admin-api.ts
- apps/web/src/features/admin/model/admin-decks-api.ts
- apps/web/src/features/admin/model/session.ts
- apps/web/src/features/admin/model/site-gate-api.ts
- apps/web/src/features/auth/model/auth-api.ts
- apps/web/src/features/cards/model/cards-api.ts
- apps/web/src/features/comments/model/comments-api.ts
- apps/web/src/features/content/model/api.ts
- apps/web/src/features/decks/model/decks-api.ts
- apps/web/src/features/tournaments/model/tournaments-api.ts
- apps/web/src/features/users/model/users-api.ts
- apps/web/src/lib/server/container.ts
- apps/web/src/lib/server/http.ts
- apps/web/src/lib/server/site-gate.ts
- apps/web/src/lib/server/user-account-adapter.ts
- apps/web/src/lib/use-session.ts
- apps/web/src/proxy.ts
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
- context/agents/active/54-infra-arg-next-public-api-url.md
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
- context/agents/done/48-infra-web-dockerfile-enxuto.md
- context/agents/done/49-infra-deploy-coolify-2apps.md
- context/agents/done/50-frontend-validacao-seo.md
- context/agents/done/51-backend-fix-maxlen-content-route.md
- context/agents/done/52-backend-container-module-factories.md
- context/agents/done/53-frontend-cutover-remover-handlers-web.md
- context/agents/queue/55-infra-env-examples.md
- context/agents/queue/56-infra-dockerignore-env-fix.md
- context/modules/api-client/status.md
- context/modules/api/status.md
- context/project/adr/ADR-007-backend-separado-do-frontend.md
