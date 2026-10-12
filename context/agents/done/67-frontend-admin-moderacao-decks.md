# Task: frontend admin — moderação de decks da comunidade (fila de reports + hide/restore)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/admin/**`
- `apps/web/src/app/admin/**`
## Depende de: [ ] `66-frontend-decks-comunidade.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Referência (projeto análogo `aegis-digimon-tcg`): `apps/web/src/screens/community/DeckReportsPanel.tsx`, `ReportedDecksPanel.tsx`.
## O que já existe (MVVM estrito):
- `features/admin/**` (admin-shell/sidebar, views, viewmodels, model), `app/admin/**` (posts, usuarios, comentarios, cartas, decks, torneios).
- Admin route: `GET /admin/decks/community/reports`, `GET /admin/decks/community/:id/reports`, `POST /admin/decks/community/:id/reports/dismiss`, `POST /admin/decks/community/:id/moderation` (lote 5).
## O que criar/alterar:
1. **Model** (`features/admin/model/deck-moderation-api.ts`): client das rotas admin de moderação (`reportedDecks`, `openReports`, `dismissReports`, `moderate`).
2. **ViewModel** `features/admin/viewmodels/use-admin-deck-moderation.ts`: fila de decks reportados, abrir reports, dismiss, hide/restore; estados loading/erro.
3. **Views**:
   - `features/admin/views/admin-deck-moderation-view.tsx` — tabela da fila (deck, autor, status, nº de reports abertos, último report), ações Hide/Restore e "dismiss reports"; painel de reports abertos por deck.
4. **Página** `app/admin/decks/moderacao/page.tsx` (administrator|editor) usando o AdminShell.
5. **AdminShell/Sidebar**: adicionar o item de navegação "Moderação de decks" (e, se ainda não houver, os itens de `admin/cartas`/`admin/torneios` pendentes — ver pendência registrada em `context/modules/cards/status.md`). Manter o gate de role.
6. **Barrels** atualizados (`features/admin/views/index.ts`, `viewmodels/index.ts`, `features/admin/index.ts`).
## Especificação:
- Não importar `@digimon/decks` no client; tipos literais em sync.
- View só JSX; chamadas HTTP só no Model/ViewModel.
- Estados vazios/erro e confirmação das ações destrutivas (hide).
## Critério de conclusão:
- [ ] Fila de moderação renderiza e executa hide/restore/dismiss via rotas reais
- [ ] Item na sidebar visível só para administrator/editor
- [ ] `pnpm turbo typecheck --filter=@digimon/web` + lint + build passando
- [ ] Barrels atualizados
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 67` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/api/src/routes/index.ts
- apps/web/public/dcg-logo.png
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
- apps/web/src/app/(public)/decks/page.tsx
- apps/web/src/components/deck-card.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/admin/model/session.ts
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
