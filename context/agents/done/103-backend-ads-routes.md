# Task: API — rotas de anúncios (público + admin) + composição
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/ads.ts` (novo)
- `apps/api/src/routes/index.ts`
- `apps/api/src/container.ts`
- `apps/api/package.json` (adicionar dependência de workspace `@digimon/ads`)
- `pnpm-lock.yaml`
## Depende de: [ ] `102-backend-module-ads.md`
## Contexto para ler: context/modules/ads/context.md, context/modules/ads/status.md, context/project/adr/ADR-007*
## Skills a carregar: codegen.md + backend.md + security.md
## O que criar (padrão das rotas existentes — `routes/cards.ts`/`decks.ts`):
1. **Composição** `adsDeps()` no `container.ts` (reusar `prisma`/`eventBus`): `PrismaAdRepository` + use cases.
2. **Rotas** (plugin registrado em `routes/index.ts`, sem prefixo):
   - `GET /ads?placement=<p>&limit=<n>` — **público**: anúncios ativos para a posição (janela de datas; ordenados por peso; até `limit`, default 5, teto 10). **Incrementa `impressions`** dos servidos de forma best-effort (não falhar a resposta se o incremento falhar). Resposta `{ ads: AdDTO[] }`.
   - `POST /ads/:id/click` — **público**: incrementa `clicks`; `204` (ou `404` se inexistente). Best-effort.
   - `GET /ads/admin` — **administrator**: lista todos (filtros `placement`, `kind`, `isActive`).
   - `POST /ads/admin` — administrator: cria (Zod).
   - `PATCH /ads/admin/:id` — administrator: edita.
   - `DELETE /ads/admin/:id` — administrator: remove.
3. **DTO** (`AdDTO`): id, title, subtitle, imageUrl, targetUrl, kind, placements, ctaLabel, sponsorName, disclosure, isActive, priority, startAt/endAt (ISO/null), openInNewTab, impressions, clicks, timestamps.
## Especificação:
- Sessão via `getAuthContext`/`requireRole` (administrator) nas rotas admin; públicas com ator opcional.
- Erros delegados ao handler global (`AppError → { error: { code, message, details } }`).
- Sem `new PrismaClient` fora do container.
## Critério de conclusão:
- [ ] Rotas registradas; `GET /ads` público filtra por placement/janela; admin exige administrator (401/403)
- [ ] Smoke `app.inject`: 200 público; 401/403 admin; 201 create; 200 patch; 204 delete; 204 click
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-api` passando
## Ao terminar: atualizar `context/modules/ads/status.md`, rodar `pnpm harness finish 103` e registrar o handoff
## Complexidade: média

## Baseline (git)
- packages/database/prisma/schema.prisma
- packages/database/src/generated/prisma/browser.ts
- packages/database/src/generated/prisma/client.ts
- packages/database/src/generated/prisma/commonInputTypes.ts
- packages/database/src/generated/prisma/enums.ts
- packages/database/src/generated/prisma/internal/class.ts
- packages/database/src/generated/prisma/internal/prismaNamespace.ts
- packages/database/src/generated/prisma/internal/prismaNamespaceBrowser.ts
- packages/database/src/generated/prisma/models.ts
- packages/database/src/generated/prisma/models/User.ts
- packages/database/src/index.ts
- pnpm-lock.yaml
- context/agents/done/102-backend-module-ads.md
- context/agents/queue/103-backend-ads-routes.md
- context/agents/queue/104-frontend-ads-slot.md
- context/agents/queue/105-frontend-admin-ads.md
- context/modules/ads/context.md
- context/modules/ads/status.md
- packages/database/prisma/migrations/20261012120000_ads/migration.sql
- packages/database/src/generated/prisma/models/Ad.ts
- packages/modules/ads/package.json
- packages/modules/ads/src/domain/actor.ts
- packages/modules/ads/src/domain/entities/ad.spec.ts
- packages/modules/ads/src/domain/entities/ad.ts
- packages/modules/ads/src/domain/events/ad-events.ts
- packages/modules/ads/src/domain/repositories/ad-repository.ts
- packages/modules/ads/src/index.ts
- packages/modules/ads/src/infra/repositories/prisma-ad-repository.ts
- packages/modules/ads/src/test/memory-ad-repository.ts
- packages/modules/ads/src/use-cases/ads.spec.ts
- packages/modules/ads/src/use-cases/create-ad.ts
- packages/modules/ads/src/use-cases/delete-ad.ts
- packages/modules/ads/src/use-cases/get-ad.ts
- packages/modules/ads/src/use-cases/list-ads.ts
- packages/modules/ads/src/use-cases/schemas.ts
- packages/modules/ads/src/use-cases/track-ad-click.ts
- packages/modules/ads/src/use-cases/update-ad.ts
- packages/modules/ads/tsconfig.json
- packages/modules/ads/vitest.config.ts
