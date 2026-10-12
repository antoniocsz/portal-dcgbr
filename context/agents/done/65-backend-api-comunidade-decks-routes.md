# Task: apps/api — rotas Fastify da comunidade de decks (+ legalidade, import/export e moderação admin)
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/**`
- `apps/api/src/container.ts`
## Depende de: [ ] `61-backend-cards-deckbuild-fields.md`, `64-backend-decks-comunidade.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/cards/context.md, context/project/adr/ADR-007*
## Skills a carregar: codegen.md + backend.md + security.md
## O que já existe:
- `apps/api/src/routes/decks.ts` (decks CRUD + admin), `apps/api/src/routes/cards.ts`, `routes/index.ts` (registra plugins sem prefixo), `container.ts` (eventBus; composição inline de Prisma + use cases nos arquivos de rota).
- `apps/api/src/server.ts` + handlers de sessão (`authenticate`, `requireRoleHook`, `getAuthContext`), handler global de erros (`AppError → { error: { code, message, details } }`).
- Módulo `@digimon/decks` (lotes 2–4): legalidade, import/export, comunidade.
## O que criar/alterar:
1. **Composição** (`routes/community-decks.ts` ou extensão de `decks.ts`): instanciar `PrismaPublicDeckRepository`, `PrismaDeckRepository`, o `CardReferenceValidator`/`DeckCardResolver` concretos (via `@digimon/cards` — `PrismaCardRepository`) e os use cases da comunidade, reusando o `eventBus` do container. **Não** duplicar regra de domínio.
2. **Rotas públicas/autenticadas** (leitura aberta a anônimos; escrita exige sessão). Caminhos e contratos (JSON idêntico ao contrato do módulo):
   - `GET /decks/community` — feed. Query `sort=top|new` (default `top`), `period=week|month|all` (default `week`), `colors=a,b` (filtra), `q` (busca), `page` (default 0). Resposta `{ decks: CommunityDeckSummary[], hasMore: boolean }`.
   - `GET /decks/community/:id` — detalhe `CommunityDeck` (inclui cardList/eggList). 404 se não público (moderação pode ver hidden).
   - `PUT /decks/community/:id/like` / `DELETE /decks/community/:id/like` — `{ liked, likeCount }`; 403 `own_deck`, 404, 429 (rate limit).
   - `POST /decks/community/:id/copies` — 204; 404.
   - `POST /decks/community/:id/reports` — body `{ reason, details? }`; 204; 400 `invalid_report`; 403 `own_deck`; 429.
   - `GET /decks/community/publications` — minhas publicações (`CommunityPublication[]`).
   - `PUT /decks/community/publications/:deckId` — publica/atualiza o snapshot; 422 `{ error: 'deck_not_found'|'deck_not_legal'|'name_not_allowed'|'deck_hidden' }`; 429.
   - `DELETE /decks/community/publications/:deckId` — 204; 404.
3. **Rotas de legalidade e import/export** (member):
   - `POST /decks/legality` — body `{ cardList, eggList }` → `{ legal, mainCount, eggCount, violations }`.
   - `POST /decks/import` — body `{ text }` → `{ cardList, eggList, skipped, trimmed }` (usa `parseDeckList` + resolver concreto de cartas).
   - `GET /decks/:slug/export` — texto DigimonCard.io (somente dono ou deck público).
4. **Rotas admin de moderação** (administrator|editor exceto onde indicado):
   - `POST /admin/decks/community/:id/moderation` — body `{ action: 'hide'|'restore' }` → `{ status }`; administrator|editor.
   - `GET /admin/decks/community/reports` — fila `{ decks: ReportedCommunityDeck[] }`; administrator|editor.
   - `GET /admin/decks/community/:id/reports` — reports abertos.
   - `POST /admin/decks/community/:id/reports/dismiss` — `{ dismissed }`.
5. **Rate limit** em like/publish/report: token bucket em memória por conta (helper local em `apps/api/src/routes/**`), capacidades sugeridas like 30/2s, publish 10/30s, report 5/60s → 429 `{ error: 'too_many_requests' }`.
6. **Registro** em `routes/index.ts`.
## Especificação:
- Reusar `getAuthContext`/`requireRole` (ator opcional nas rotas públicas, obrigatório nas de escrita). Papéis: `administrator`, `editor`, `member`.
- Sem `new PrismaClient` no arquivo de rota se o container já expõe `prisma`; reusar `container.ts`.
- Validação de entrada com os schemas Zod do módulo.
## Critério de conclusão:
- [ ] Todas as rotas acima registradas; contratos JSON/erros idênticos aos do módulo
- [ ] Smoke via `app.inject`: 401 anônimo em escrita; 403 `own_deck` no like do próprio; 200 feed; 422 publish de deck ilegal; 403 moderação para member
- [ ] `pnpm turbo typecheck --filter=@digimon/app-api` + lint + build passando
- [ ] `pnpm harness check --barrel --db` ok
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 65` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/web/public/dcg-logo.png
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/admin/model/session.ts
- apps/web/src/features/auth/viewmodel/use-login-view-model.ts
- apps/web/src/features/auth/viewmodel/use-register-view-model.ts
- apps/web/src/features/cards/model/types.ts
- apps/web/src/features/cards/views/admin-cards-view.tsx
- apps/web/src/features/cards/views/card-filters.tsx
- apps/web/src/lib/use-session.ts
- context/modules/cards/status.md
- context/modules/database/status.md
- context/modules/decks/status.md
- context/modules/web/status.md
- packages/database/prisma/schema.prisma
- packages/database/src/generated/prisma/browser.ts
- packages/database/src/generated/prisma/client.ts
- packages/database/src/generated/prisma/commonInputTypes.ts
- packages/database/src/generated/prisma/enums.ts
- packages/database/src/generated/prisma/internal/class.ts
- packages/database/src/generated/prisma/internal/prismaNamespace.ts
- packages/database/src/generated/prisma/internal/prismaNamespaceBrowser.ts
- packages/database/src/generated/prisma/models.ts
- packages/database/src/generated/prisma/models/Card.ts
- packages/database/src/generated/prisma/models/Deck.ts
- packages/database/src/generated/prisma/models/User.ts
- packages/database/src/index.ts
- packages/modules/cards/src/domain/entities/card.ts
- packages/modules/cards/src/index.ts
- packages/modules/cards/src/infra/repositories/prisma-card-repository.ts
- packages/modules/cards/src/use-cases/cards.spec.ts
- packages/modules/cards/src/use-cases/import-cards.ts
- packages/modules/cards/src/use-cases/schemas.ts
- packages/modules/decks/src/domain/actor.ts
- packages/modules/decks/src/domain/entities/deck.ts
- packages/modules/decks/src/domain/events/deck-events.ts
- packages/modules/decks/src/domain/repositories/card-reference-validator.ts
- packages/modules/decks/src/index.ts
- packages/modules/decks/src/infra/repositories/prisma-deck-repository.ts
- packages/modules/decks/src/use-cases/copy-deck.ts
- packages/modules/decks/src/use-cases/create-deck.ts
- packages/modules/decks/src/use-cases/deck-workflow.spec.ts
- packages/modules/decks/src/use-cases/publish-deck.ts
- packages/modules/decks/src/use-cases/schemas.ts
- packages/modules/decks/src/use-cases/update-deck.ts
- apps/web/src/lib/session.ts
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/done/60-backend-database-schema-deckbuild-community.md
- context/agents/done/61-backend-cards-deckbuild-fields.md
- context/agents/done/62-backend-decks-model-legalidade.md
- context/agents/done/63-backend-decks-import-export.md
- context/agents/done/64-backend-decks-comunidade.md
- context/agents/queue/65-backend-api-comunidade-decks-routes.md
- context/agents/queue/66-frontend-decks-comunidade.md
- context/agents/queue/67-frontend-admin-moderacao-decks.md
- packages/database/prisma/migrations/20261011120000_deckbuild_community/migration.sql
- packages/database/src/generated/prisma/models/CommunityDeckReport.ts
- packages/database/src/generated/prisma/models/PublicDeck.ts
- packages/database/src/generated/prisma/models/PublicDeckCopy.ts
- packages/database/src/generated/prisma/models/PublicDeckLike.ts
- packages/modules/decks/src/domain/community/community-colors.ts
- packages/modules/decks/src/domain/community/community-types.ts
- packages/modules/decks/src/domain/community/deck-name-moderation.ts
- packages/modules/decks/src/domain/deck-list/deck-list.spec.ts
- packages/modules/decks/src/domain/deck-list/parse-deck-list.ts
- packages/modules/decks/src/domain/deck-list/serialize-deck-list.ts
- packages/modules/decks/src/domain/deck-list/types.ts
- packages/modules/decks/src/domain/deck-sizes.ts
- packages/modules/decks/src/domain/entities/public-deck.ts
- packages/modules/decks/src/domain/repositories/public-deck-repository.ts
- packages/modules/decks/src/infra/repositories/prisma-public-deck-repository.ts
- packages/modules/decks/src/use-cases/check-deck-legality.ts
- packages/modules/decks/src/use-cases/community/community.spec.ts
- packages/modules/decks/src/use-cases/community/dismiss-deck-reports.ts
- packages/modules/decks/src/use-cases/community/get-community-deck.ts
- packages/modules/decks/src/use-cases/community/like-community-deck.ts
- packages/modules/decks/src/use-cases/community/list-community-decks.ts
- packages/modules/decks/src/use-cases/community/list-publications.ts
- packages/modules/decks/src/use-cases/community/list-reported-decks.ts
- packages/modules/decks/src/use-cases/community/moderate-community-deck.ts
- packages/modules/decks/src/use-cases/community/open-deck-reports.ts
- packages/modules/decks/src/use-cases/community/publish-deck-to-community.ts
- packages/modules/decks/src/use-cases/community/record-deck-copy.ts
- packages/modules/decks/src/use-cases/community/report-community-deck.ts
- packages/modules/decks/src/use-cases/community/schemas.ts
- packages/modules/decks/src/use-cases/community/summary.ts
- packages/modules/decks/src/use-cases/community/unlike-community-deck.ts
- packages/modules/decks/src/use-cases/community/unpublish-deck-from-community.ts
