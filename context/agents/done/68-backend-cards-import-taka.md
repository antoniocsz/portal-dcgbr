# Task: @digimon/cards — importação real do catálogo externo (TakaOtaku) + rota admin
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/**`
- `apps/api/src/routes/cards.ts`
- `apps/api/src/container.ts`
## Depende de: [ ] `61-backend-cards-deckbuild-fields.md`
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md
## Skills a carregar: codegen.md + backend.md + data.md
## Fonte de referência (projeto análogo `aegis-digimon-tcg`): `tools/import-taka-cards.mjs` (mapeamento) — a base é a comunidade **TakaOtaku/Digimon-Card-App**.
## Fonte real (validada):
- JSON: `https://raw.githubusercontent.com/TakaOtaku/Digimon-Card-App/main/src/assets/cardlists/DigimonCards.json` (~8,7 MB, **4.482 registros**, array de objetos).
- Arte oficial (validada 200 image/png): `https://world.digimoncard.com/images/cardlist/card/<CARD_NUMBER>.png` (ex.: `.../BT1-009.png`).
## Campos do registro de origem (amostra real):
`cardNumber` ("AD1-001"), `name.english`, `cardType` ("Digimon"|"Tamer"|"Option"|"Digi-Egg"|"Digimon/Option"), `color` ("Red"|"Blue/"… podendo ser "Red/Blue"), `cardLv` ("Lv.4"), `dp` ("5000"), `playCost` ("5"), `rarity` ("R"), `attribute` ("Vaccine"), `form` ("Champion"), `digivolveCondition[]` (`{color,level,cost}`), `effect`, `digivolveEffect`, `securityEffect`, `notes`, `cardImage`.
## O que criar:
1. **Porta** `domain/sources/card-source-provider.ts`: `interface CardSourceProvider { fetchCatalog(): Promise<RawSourceCard[]> }` (DIP; sem I/O no domínio).
2. **Mapper puro** `domain/sources/taka/taka-card-mapper.ts`: `mapTakaCard(raw: TakaCardRecord): CardImportInput | null` (+ tipo `TakaCardRecord`). Regras:
   - `dcgId`/`number` = `cardNumber`; `name` = `name.english` (limpar NBSP/quebras); `rarity` = `rarity`.
   - `type`: `Digimon`→`digimon`, `Tamer`→`tamer`, `Option`→`option`, `Digi-Egg`→`digiegg`, `Digimon/Option`→`digimon`; **não reconhecido → `null`** (linha ignorada).
   - `colors`: split por `/` e mapear `Red→red`, `Blue→blue`, `Yellow→yellow`, `Green→green`, `Purple→purple`, `Black→black`, `White→white`.
   - `level`: extrair número de `cardLv` (`Lv.4`→4).
   - `dp`/`playCost`: número (blank/`-` → `null`).
   - `attribute`: string (blank → null).
   - `digiType`: do campo de traço quando disponível e limpo; senão `null` (documentar a decisão).
   - `evolutionConditions`: de `digivolveCondition[]` filtrando `level` não numérico; `color: "All"` expande para as 7 cores; cada item `{color, level, cost}`.
   - `effects`: concatenar `effect` + `digivolveEffect` + `securityEffect` (não vazios), separados por `\n\n`.
   - `imageUrl`: `https://world.digimoncard.com/images/cardlist/card/${cardNumber}.png`.
   - `setCode`: prefixo do `cardNumber` antes do `-` (ex.: `BT1`, `AD1`, `EX13`, `ST24`, `P`).
   - `releaseDate`: `null` (a fonte não traz de forma confiável) — reportar.
3. **Adapter de infra** `infra/sources/taka-cards-source-provider.ts`: implementa `CardSourceProvider` com `fetch` da URL acima (injetável p/ teste; timeout; erro claro).
4. **Use case** `use-cases/import-cards-from-source.ts`: `ImportCardsFromSourceUseCase` — recebe opcionalmente `{ source?: CardSourceProvider; sets?: string[]; ids?: string[]; max?: number }`; baixa o catálogo, mapeia (descarta `null`), filtra por `sets`/`ids`/`max`, e importa reusando o fluxo de `ImportCardsUseCase` (mesmas invariantes: dcgId duplicado no lote, reimport atualiza). Retorna `{ imported, updated, skipped, sets }`. **Só admin** (`requireCurator`, como o ImportCards atual).
5. **Rota** `POST /cards/admin/import-source` em `apps/api/src/routes/cards.ts` (administrator): body opcional `{ source?: string; sets?: string[]; ids?: string[]; max?: number }`; delega ao handler global de erros.
6. **Composição** em `apps/api/src/container.ts` (`cardsDeps()`): instanciar o provider concreto + o use case.
7. **Barrel** `packages/modules/cards/src/index.ts`: exportar o use case, a porta, o mapper e o provider concreto.
8. **Testes** (`import-cards-from-source.spec.ts`): mapper com fixture de 3–4 registros (Digimon, Tamer, Digi-Egg, Digimon/Option, tipo desconhecido ignorado; "All" expandido; `Lv.4`→4; `imageUrl` e `setCode` corretos) e use case com provider fake (filtro por set/ids/max, `skipped` de tipo desconhecido). **Sem rede nos testes.**
9. **Execução real (popular o banco local):** após implementar, rodar a importação via `app.inject` (sessão admin, como o smoke da task 65) e confirmar via `GET /cards` que o catálogo foi populado (registrar a contagem retornada). Se o Postgres local não estiver acessível, **reportar** e não improvisar.
## Especificação:
- Não alterar o contrato de `ImportCardsUseCase`/`POST /cards/admin/import` existentes (a nova rota é aditiva).
- Sem I/O de rede no domínio; DIP respeitado.
- Não alterar `apps/web/**` nesta task.
## Critério de conclusão:
- [ ] Mapper + use case + provider + rota + composição + barrel
- [ ] Testes unitários do mapper/use case passando (sem rede)
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/app-api` passando
- [ ] Importação real executada (via inject) e contagem reportada — ou bloqueio reportado
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 68` e registrar o handoff
## Complexidade: alta

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
- context/agents/queue/68-backend-cards-import-taka.md
- context/agents/queue/69-frontend-cards-artwork-import.md
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
