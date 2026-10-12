# Task: @digimon/decks — comunidade: snapshot congelado, feed, likes, cópias e moderação
## Agente: `agente-backend`
## Módulo: `packages/modules/decks`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/decks/**`
## Depende de: [ ] `62-backend-decks-model-legalidade.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/decks/status.md
## Skills a carregar: codegen.md + backend.md + data.md
## Referência (projeto análogo `aegis-digimon-tcg`): `packages/shared/src/decks/community.ts` (contrato), `apps/api/src/community/CommunityDeckStore.ts` (regras), `apps/api/src/community/deckNameModeration.ts`.
## O que já existe:
- Prisma (lote 1): `PublicDeck`, `PublicDeckLike`, `PublicDeckCopy`, `CommunityDeckReport`, enum `PublicDeckStatus { PUBLIC HIDDEN UNPUBLISHED }`.
- `Deck` com cardList+eggList+coverCardId, status draft|published, isPublic; `CheckDeckLegalityUseCase`.
## O que criar (domínio + use cases + repo Prisma + eventos; SEM HTTP):
1. **Tipos/contrato** (`domain/community/community-types.ts`):
   - `CommunityDeckStatus = 'public' | 'hidden' | 'unpublished'`
   - `CommunitySort = 'top' | 'new'`, `CommunityPeriod = 'week' | 'month' | 'all'`
   - `CommunityDeckSummary { id, name, ownerId, ownerName, colors: string[], coverCardId: string|null, likeCount, copyCount, likedByMe, legal, status, publishedAt, updatedAt }`
   - `CommunityDeck extends Summary { cardList, eggList }`
   - `CommunityPublication { id, sourceDeckId, name, likeCount, outdated, status }`
   - `CommunityDeckReport`, `ReportedCommunityDeck`, `CommunityModerationAction = 'hide' | 'restore'`, `CommunityReportReason`.
2. **Entidade `PublicDeck`** (`domain/entities/public-deck.ts`): factory `fromSource(deck, ownerId, { colors, legal })` que **congela** os dados; método `isOutdated(savedUpdatedAt)`; invariantes. `colors` = até 3 cores dominantes (contagem sobre cardList, via metadados de carta).
3. **Name moderation** (`domain/community/deck-name-moderation.ts`): `reviewDeckName(name)` → `{ allowed, name }` (trim, tamanho máximo ~40, lista simples de termos bloqueados). Pura e testável.
4. **Repository interface** `PublicDeckRepository` (DIP): `create`, `update`, `findBySourceDeck`, `findById`, `list(query)`, `publications(ownerId)`, `unpublish`, `setStatus`, `like/unlike/addCopy`, `report/listReports/queueReports/dismissReports`.
5. **Use cases** (`use-cases/community/*.ts`): **ATENÇÃO — já existe `PublishDeckUseCase` (publica o próprio Deck, draft→published) no módulo; NÃO reutilize esse nome nem altere-o.** Use os nomes abaixo:
   - `PublishDeckToCommunityUseCase` — lê o **deck salvo do repositório** (nunca do request), valida legalidade (`CheckDeckLegalityUseCase`), revisa o nome, cria/atualiza o snapshot `PublicDeck` (status `public`). Se já existe e está `hidden` → erro `deck_hidden`; deck não encontrado ou de outro dono → `deck_not_found`.
   - `UnpublishDeckFromCommunityUseCase` — status → `unpublished` (likes preservados).
   - `ListPublicationsUseCase` — minhas publicações (public/hidden) + flag `outdated` (compara `updatedAt` do snapshot com `updatedAt` do deck salvo).
   - `ListCommunityDecksUseCase` — feed: filtro `status=public`, cores (`colors[]` contém), busca (nome/autor), `sort=top` (likes recentes por período quando `period != all`) | `new`, paginação por página (`page`, `pageSize=24`) sem COUNT total. Legalidade re-julgada na leitura.
   - `GetCommunityDeckUseCase` — detalhe público; `includeHidden` só p/ moderação.
   - `LikeCommunityDeckUseCase` / `UnlikeCommunityDeckUseCase` — autor não curte o próprio (`own_deck`); 1 por conta; contador na mesma transação.
   - `RecordDeckCopyUseCase` — 1 cópia por conta (`ON CONFLICT DO NOTHING`), incrementa `copyCount` só quando insere.
   - `ReportCommunityDeckUseCase` — autor não reporta o próprio; 1 report aberto por conta/deck (novo substitui); retorna alvo p/ moderação.
   - `ModerateCommunityDeckUseCase` (`hide`/`restore`) — `hide` também remove a publicação do feed e **fecha** os reports abertos; só `administrator|editor`.
   - `ListReportedDecksUseCase` / `OpenDeckReportsUseCase` / `DismissDeckReportsUseCase` — fila de moderação (administrator|editor).
6. **Impl Prisma** `infra/repositories/prisma-public-deck-repository.ts` (transações p/ contadores; o join de autor traz `User.name`).
7. **Eventos** (`domain/events/deck-events.ts`): adicionar tipos (ex.: `deck.publication.published`, `deck.publication.unpublished`, `deck.publication.liked`, `deck.publication.reported`, `deck.publication.moderated`) — sem quebrar os existentes.
8. **Barrel**: exportar entidades, tipos, use cases e a interface do repositório.
9. **Testes** (`community.spec.ts` com memory repo): publish congela snapshot e bloqueia ilegal; publish não lê do request; unpublish preserva likes; feed top/new/filtro cor/busca; like/unlike (autor bloqueado, idempotente); recordCopy só conta 1x; report (autor bloqueado, 1 por conta); moderate hide fecha reports e some do feed; publications marca `outdated`.
## Especificação:
- Regras de autorização com papéis globais do projeto (`actor.role`), consistente com o resto do módulo (`isManager`/`MANAGER_ROLES`).
- Sem I/O HTTP aqui; sem `new PrismaClient` fora do repositório (DIP).
- Autorização de "só dono publica o próprio deck": verificar `deck.ownerId === actor.id`.
## Critério de conclusão:
- [ ] Snapshot congelado + `outdated`; feed com sort/period/cores/busca/paginação
- [ ] like/unlike/copy/report/moderate com regras e testes
- [ ] `pnpm turbo typecheck --filter=@digimon/decks` passando
- [ ] Lint + testes passando
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 64` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
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
- packages/modules/decks/src/domain/entities/deck.ts
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
- context/agents/queue/64-backend-decks-comunidade.md
- context/agents/queue/65-backend-api-comunidade-decks-routes.md
- context/agents/queue/66-frontend-decks-comunidade.md
- context/agents/queue/67-frontend-admin-moderacao-decks.md
- packages/database/prisma/migrations/20261011120000_deckbuild_community/migration.sql
- packages/database/src/generated/prisma/models/CommunityDeckReport.ts
- packages/database/src/generated/prisma/models/PublicDeck.ts
- packages/database/src/generated/prisma/models/PublicDeckCopy.ts
- packages/database/src/generated/prisma/models/PublicDeckLike.ts
- packages/modules/decks/src/domain/deck-list/deck-list.spec.ts
- packages/modules/decks/src/domain/deck-list/parse-deck-list.ts
- packages/modules/decks/src/domain/deck-list/serialize-deck-list.ts
- packages/modules/decks/src/domain/deck-list/types.ts
- packages/modules/decks/src/domain/deck-sizes.ts
- packages/modules/decks/src/use-cases/check-deck-legality.ts
