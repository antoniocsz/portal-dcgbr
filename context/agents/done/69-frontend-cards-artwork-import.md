# Task: frontend — mostrar a arte da carta na grade + filtros expostos + importação externa no admin
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/cards/**`
- `apps/web/src/components/card-tile.tsx`
- `apps/web/src/app/(public)/cartas/**`
## Depende de: [ ] `68-backend-cards-import-taka.md`
## Contexto para ler: context/modules/cards/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## O que já existe:
- `components/card-tile.tsx`: tile estilizado (header colorido + gradiente + número + `Sparkles`) — **não mostra arte**.
- `features/cards/views/{cards-view,cards-grid,card-filters,card-detail-view,admin-cards-view}.tsx`; `viewmodels/{use-card-list,use-card,use-card-sets,use-admin-cards,card-view}.ts`; `model/{types,cards-api}.ts`.
- `CardSummary`/`Card` já têm `imageUrl` (a listagem da API devolve `imageUrl`).
- Rota nova do lote 8: `POST /cards/admin/import-source` (administrator).
## O que criar/alterar (MVVM estrito):
1. **Arte na grade** (`components/card-tile.tsx` + `cards-grid.tsx` + `card-view.ts`):
   - `CardTileData` ganha `imageUrl?: string | null`.
   - Renderizar a imagem da carta na área central (aspecto de carta, ex. `aspect-[5/7]`), com `loading="lazy"` e `decoding="async"`; **fallback** para o gradiente + `Sparkles` atual quando `imageUrl` ausente **ou** quando a imagem falhar (estado de erro no componente).
   - `toCardTileData` passa a incluir `imageUrl`.
   - Manter o visual atual (header/footer) quando não há arte.
2. **Filtros expostos** (`card-filters.tsx` + `use-card-list.ts`):
   - Adicionar filtro de **custo de jogo** (`playCost`, opções 0–7+; a API já aceita).
   - Adicionar filtro de **set** (`setCode`) que usa `use-card-sets` — **renderizar apenas quando a lista de sets não estiver vazia** (a task 70 popula `card_sets`; hoje `GET /cards/sets` pode retornar 0, então o filtro deve se auto-ocultar sem quebrar a UI).
   - Manter busca/tipo/cor; todo filtro reseta para a página 1.
3. **Ficha** (`card-detail-view.tsx`): manter `<img>` da arte com o mesmo fallback; opcionalmente usar `next/image` (se o padrão do projeto permitir) — se mudar, garantir `alt` e dimensões.
4. **Admin** (`admin-cards-view.tsx` + `use-admin-cards.ts` + `cards-api.ts`):
   - Botão **"Importar catálogo externo (TakaOtaku)"** (visível só para administrator) que chama `POST /cards/admin/import-source` e mostra o resultado (`imported`/`updated`/`skipped`), com estado de progresso/erro. Reusar o painel de importação existente; não remover o import por JSON.
5. **Barrels** da feature atualizados.
## Especificação:
- Não importar `@digimon/cards` no client (tipos literais em sync).
- Não alterar o backend; consumir as rotas reais.
- Responsivo: a arte da carta deve escalar bem de 2-col mobile a 4-col desktop; cuidado com CLS (reservar proporção).
- Estados loading/erro/vazio e acessibilidade (alt com nome da carta).
## Critério de conclusão:
- [ ] Grade mostra a arte (com fallback correto em ausência/erro)
- [ ] Filtros de set e custo funcionando
- [ ] Botão de importação externa no admin chamando a rota real
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando
- [ ] Barrels atualizados
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/cards/status.md`, rodar `pnpm harness finish 69` e registrar o handoff
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
- context/agents/queue/69-frontend-cards-artwork-import.md
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
