# Task: @digimon/cards — popular card_sets na importação externa (nomes de expansão)
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/**`
- `apps/api/src/routes/cards.ts`
- `apps/api/src/container.ts`
## Depende de: [ ] `68-backend-cards-import-taka.md`
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md
## Skills a carregar: codegen.md + backend.md + data.md
## Situação:
- A task 68 importou 4.480 cartas, mas **não populou `card_sets`** → `GET /cards/sets` retorna 0 e o filtro de set do frontend fica vazio.
- A fonte TakaOtaku traz o nome da expansão no campo **`notes`**, no formato `"<CODE>: <NOME>"` (ex.: `"AD-01: ADVANCED BOOSTER DIGIMON GENERATION"`, `"BT-01: NEW EVOLUTION"`), e `block` (ex.: `["05"]`).
- O `Card.setCode` já é o prefixo do `cardNumber` (`BT1`, `AD1`, `EX13`, `ST24`, `P`).
## O que criar/alterar:
1. **Derivação de sets** a partir do catálogo mapeado: agrupar por `setCode`, extrair `code`/`name` de `notes` (`<CODE>: <NOME>`), com fallback para `setCode` como nome quando não houver `notes` parseável. `releaseDate`: `null` (a fonte não traz confiável) — não inventar.
2. **`ImportCardsFromSourceUseCase`**: montar o array `sets` (deduplicado por `code`) e repassá-lo ao `ImportCardsUseCase` (o payload de import já aceita `sets?` → `CardSetRepository.upsert`), de modo que a importação externa popule `card_sets` junto com as cartas. Retornar também a contagem de `sets`.
3. **Schema/rota**: manter o contrato de `POST /cards/admin/import-source` (opcionalmente o retorno ganha `sets` se ainda não tiver).
4. **Testes**: estender o spec existente — derivação de sets (code/name de `notes`, dedupe, fallback) com fixture, sem rede.
5. **Execução real:** reexecutar a importação externa via `app.inject` (sessão admin) no Postgres local; confirmar via `GET /cards/sets` que os sets aparecem (contagem) e que `GET /cards?setCode=BT1` filtra corretamente. Se o Postgres local não estiver acessível, reportar.
## Critério de conclusão:
- [ ] `card_sets` populado na importação externa (upsert por `code`)
- [ ] `GET /cards/sets` retorna os sets com `code`/`name`
- [ ] `GET /cards?setCode=<code>` filtra
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/app-api` passando
- [ ] Reexecução real confirmada — ou bloqueio reportado
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 70` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/api/src/routes/index.ts
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
- apps/web/src/app/(public)/decks/page.tsx
- apps/web/src/components/deck-card.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/admin/index.ts
- apps/web/src/features/admin/model/session.ts
- apps/web/src/features/admin/views/admin-shell.tsx
- apps/web/src/features/auth/viewmodel/use-login-view-model.ts
- apps/web/src/features/auth/viewmodel/use-register-view-model.ts
- apps/web/src/features/cards/model/types.ts
- apps/web/src/features/cards/views/admin-cards-view.tsx
- apps/web/src/features/cards/views/card-filters.tsx
- apps/web/src/features/decks/model/types.ts
- apps/web/src/features/decks/viewmodels/deck-view.ts
- apps/web/src/features/decks/viewmodels/index.ts
- apps/web/src/features/decks/viewmodels/use-deck-form.ts
- apps/web/src/features/decks/views/deck-form-view.tsx
- apps/web/src/features/decks/views/index.ts
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
- apps/api/src/routes/community-decks.ts
- apps/api/src/routes/community-rate-limit.ts
- apps/web/src/app/(public)/decks/comunidade/[id]/page.tsx
- apps/web/src/app/(public)/decks/comunidade/page.tsx
- apps/web/src/app/admin/decks/moderacao/page.tsx
- apps/web/src/features/admin/model/deck-moderation-api.ts
- apps/web/src/features/admin/viewmodels/use-admin-deck-moderation.ts
- apps/web/src/features/admin/views/admin-deck-moderation-view.tsx
- apps/web/src/features/decks/index.ts
- apps/web/src/features/decks/model/community-api.ts
- apps/web/src/features/decks/model/community-types.ts
- apps/web/src/features/decks/viewmodels/deck-sections.ts
- apps/web/src/features/decks/viewmodels/use-community-deck.ts
- apps/web/src/features/decks/viewmodels/use-community-decks.ts
- apps/web/src/features/decks/viewmodels/use-deck-import-export.ts
- apps/web/src/features/decks/viewmodels/use-deck-publications.ts
- apps/web/src/features/decks/views/community-deck-detail-view.tsx
- apps/web/src/features/decks/views/community-decks-view.tsx
- apps/web/src/features/decks/views/deck-export-modal.tsx
- apps/web/src/features/decks/views/deck-import-modal.tsx
- apps/web/src/features/decks/views/deck-publish-modal.tsx
- apps/web/src/lib/session.ts
- context/agents/active/69-frontend-cards-artwork-import.md
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/done/60-backend-database-schema-deckbuild-community.md
- context/agents/done/61-backend-cards-deckbuild-fields.md
- context/agents/done/62-backend-decks-model-legalidade.md
- context/agents/done/63-backend-decks-import-export.md
- context/agents/done/64-backend-decks-comunidade.md
- context/agents/done/65-backend-api-comunidade-decks-routes.md
- context/agents/done/66-frontend-decks-comunidade.md
- context/agents/done/67-frontend-admin-moderacao-decks.md
- context/agents/done/68-backend-cards-import-taka.md
- context/agents/queue/70-backend-cards-sets-populate.md
- packages/database/prisma/migrations/20261011120000_deckbuild_community/migration.sql
- packages/database/src/generated/prisma/models/CommunityDeckReport.ts
- packages/database/src/generated/prisma/models/PublicDeck.ts
- packages/database/src/generated/prisma/models/PublicDeckCopy.ts
- packages/database/src/generated/prisma/models/PublicDeckLike.ts
- packages/modules/cards/src/domain/sources/card-source-provider.ts
- packages/modules/cards/src/domain/sources/taka/taka-card-mapper.ts
- packages/modules/cards/src/infra/sources/taka-cards-source-provider.ts
- packages/modules/cards/src/use-cases/import-cards-from-source.spec.ts
- packages/modules/cards/src/use-cases/import-cards-from-source.ts
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
