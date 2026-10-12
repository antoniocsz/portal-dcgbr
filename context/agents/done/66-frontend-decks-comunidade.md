# Task: frontend — decks da comunidade (feed, página do deck, like, publicar, import/export)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/**`
- `apps/web/src/app/(public)/decks/**`
- `apps/web/src/app/(member)/decks/**`
- `apps/web/src/components/deck-card.tsx` (se precisar expor props novas)
## Depende de: [ ] `65-backend-api-comunidade-decks-routes.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, context/project/design (design system)
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Referência (projeto análogo `aegis-digimon-tcg`): `apps/web/src/screens/community/CommunityDeckPage.tsx`, `LobbyCommunityDecks.tsx`, `LikeButton.tsx`, `DeckPublishModal.tsx`, `DeckTextModals.tsx`, `deckSections.ts`, `communityDeckListing.ts`.
## O que já existe (MVVM estrito):
- `features/decks/model/{types.ts,decks-api.ts}`, `features/decks/viewmodels/{use-deck-list,use-deck,use-deck-form,use-deck-actions,deck-view}.ts`, `features/decks/views/{decks-list-view,deck-detail-view,deck-form-view}.tsx`.
- Páginas: `app/(public)/decks` (listagem), `app/(member)/decks/novo` (form), e detalhe.
- Componentes do design system: `DeckCard`, `CardTile`, `Button`, `StatusBadge`, `ColorChip` etc. (via `@/components`).
## O que criar/alterar (MVVM: View só JSX; ViewModel orquestra; Model tipos+api, sem hooks/JSX):
1. **Model** (`model/community-types.ts` + `model/community-api.ts`): tipos do contrato (`CommunityDeckSummary`, `CommunityDeck`, `CommunityPublication`, `CommunitySort`, `CommunityPeriod`) e client HTTP para as rotas novas (`/decks/community*`, `/decks/legality`, `/decks/import`, `/decks/:slug/export`, `/decks/community/publications*`). Reusar o client/fetch existente da feature.
2. **Helpers de apresentação** (`viewmodels/deck-sections.ts`): agrupar cardList+eggList em seções (Eggs → Digimon por nível → Tamers → Options → Outros) usando os metadados das cartas; `deckCurve` (curva de custo); `dominantColors`.
3. **ViewModels**:
   - `use-community-decks.ts` — feed (sort/period/cores/busca/página), like otimista com rollback.
   - `use-community-deck.ts` — detalhe.
   - `use-deck-publications.ts` — minhas publicações (publicar/atualizar/despublicar; flag `outdated`).
   - `use-deck-import-export.ts` — importar colando texto/serializar/baixar texto.
4. **Views**:
   - `community-decks-view.tsx` — feed com filtros (sort top/new, período, cores) + busca + grid de `DeckCard`, botão like por card, contadores de likes/cópias, badge "legal/ilegal".
   - `community-deck-detail-view.tsx` — página do deck: autor, cores, capa, badge de legalidade, contagem main/egg, botão like, "copiar pra mim", "exportar", seção da decklist (usa `deck-sections`).
   - `deck-publish-modal.tsx` — confirmar publicar/atualizar/despublicar + mensagens de erro (`deck_not_legal`, `name_not_allowed`, `deck_hidden`).
   - `deck-import-modal.tsx` + `deck-export-modal.tsx` — colar texto/TTS e copiar texto.
   - Evoluir `deck-form-view.tsx` para editar `eggList` e `coverCardId`, com validação de legalidade ao vivo (chama `/decks/legality`).
5. **Páginas** (App Router, SSR/ISR onde couber):
   - `app/(public)/decks/comunidade/page.tsx` — feed (usa o ViewModel; público).
   - `app/(public)/decks/comunidade/[id]/page.tsx` — detalhe do deck da comunidade.
   - Adicionar atalho/aba no `(public)/decks` para a comunidade e no form a publicação.
6. **Barrels** (`features/decks/index.ts`/`views/index.ts`/`viewmodels/index.ts`) atualizados.
## Especificação:
- Não importar `@digimon/decks` no client — manter tipos literais em sync (decisão do projeto).
- **Contrato real das rotas: leia `apps/api/src/routes/community-decks.ts` (lote 5) para os paths, query params, respostas e códigos de erro exatos.** Observações: feed responde `{ decks, hasMore }`; o `:deckId` de `/decks/community/publications/:deckId` é o **slug** do deck; erros seguem o envelope `{ error: { code, message, details } }` (ex.: like do próprio → 403 `FORBIDDEN`; publish ilegal → 422 `VALIDATION_ERROR`; rate limit → 429 `too_many_requests`).
- Consumir as rotas reais de `apps/api` (via `@digimon/api-client`/client existente da feature); sem fallback/dados fake.
- Seguir o design system e heurísticas de Nielsen (estados loading/erro/vazio, feedback otimista, acessibilidade).
## Critério de conclusão:
- [ ] Tips/typecheck: `pnpm turbo typecheck --filter=@digimon/web` passando
- [ ] Lint passando; build do web (`pnpm turbo build --filter=@digimon/web`) passando
- [ ] MVVM respeitado (nenhum `useQuery`/fetch em arquivo de view)
- [ ] Barrels atualizados
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 66` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/api/src/routes/index.ts
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
- apps/api/src/routes/community-decks.ts
- apps/api/src/routes/community-rate-limit.ts
- apps/web/src/lib/session.ts
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/done/60-backend-database-schema-deckbuild-community.md
- context/agents/done/61-backend-cards-deckbuild-fields.md
- context/agents/done/62-backend-decks-model-legalidade.md
- context/agents/done/63-backend-decks-import-export.md
- context/agents/done/64-backend-decks-comunidade.md
- context/agents/done/65-backend-api-comunidade-decks-routes.md
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
