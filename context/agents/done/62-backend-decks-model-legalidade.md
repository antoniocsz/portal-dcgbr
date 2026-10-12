# Task: @digimon/decks — modelo de lista dupla (main + egg + capa) e legalidade de composição
## Agente: `agente-backend`
## Módulo: `packages/modules/decks`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/decks/**`
- `apps/api/src/container.ts`
- `apps/api/src/routes/decks.ts`
## Depende de: [ ] `60-backend-database-schema-deckbuild-community.md`, `61-backend-cards-deckbuild-fields.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/decks/status.md, context/modules/cards/context.md
## Skills a carregar: codegen.md + backend.md + data.md
## O que já existe:
- Módulo `@digimon/decks`: `Deck` (cardList `{cardId,quantity}[]`, format string, status draft|published, isPublic), `DeckCopy`, repositório Prisma, use cases (Create/Update/Publish/Delete/Get/List/Copy), `CardReferenceValidator` (interface DIP), schemas Zod, barrel, testes (`deck-workflow.spec.ts`).
- Prisma `Deck` (lote 1) tem `eggList Json @default("[]")` e `coverCardId String?`.
- Cards (lote 1): `Card.type` inclui `'digiegg'`; `Card.maxCountInDeck` existe.
## O que criar/alterar:
1. **Entidade `Deck`**: adicionar `eggList: DeckCardEntry[]` e `coverCardId: string | null`. Ajustar `CreateDeckData`/`UpdateDeckData`/`DeckData`. `assertValidCardList` também valida `eggList`.
2. **Repository** (`deck-repository.ts`) + **`PrismaDeckRepository`**: persistir/ler `eggList`/`coverCardId` (JSON/null).
3. **Schemas Zod** (`use-cases/schemas.ts`): `deckCardSchema` reutilizado; create/update aceitam `eggList` (default `[]`) e `coverCardId` (opcional/null).
4. **Use cases** Create/Update: propagar `eggList`/`coverCardId`.
5. **`CardReferenceValidator`** (interface): manter `assertCardsExist(entries)` (usado por Create/Update) e **adicionar** `inspect(entries: DeckCardEntry[]): Promise<CardReferenceInfo[]>` com:
   ```ts
   export interface CardReferenceInfo { cardId: string; quantity: number; exists: boolean; maxCountInDeck: number; isDigiEgg: boolean }
   ```
   Atualizar a implementação concreta `PrismaCardReferenceValidator` em `apps/api/src/container.ts` para implementar `inspect` (select `id,type,maxCountInDeck`; `isDigiEgg = type === 'DIGIEGG'`).
6. **Novo use case `CheckDeckLegalityUseCase`** (`use-cases/check-deck-legality.ts`): recebe `{ cardList, eggList }` + o `CardReferenceValidator` (usa `inspect`) → `{ legal, mainCount, eggCount, violations }`. Regras (decisão D1/D3 — sem banlist nesta fase):
   - main deck = exatamente 50 cartas (soma das quantities).
   - egg deck ≤ 5 cartas.
   - cada carta ≤ `maxCountInDeck` (default 4) entre main+egg.
   - nenhuma carta inexistente no catálogo (`exists === false` → violação `unknown_card`).
   - zona de egg: cartas Digi-Egg só em `eggList`; cartas não-Digi-Egg só em `cardList` (`wrong_zone`).
   - `violations` com `{ code, cardId?, message }`.
7. **PublishDeckUseCase**: passa a exigir deck **legal** (usa `CheckDeckLegalityUseCase`) além de ter cartas. Manter override admin existente intacto.
8. **Barrel**: exportar `CheckDeckLegalityUseCase` + tipos; ajustar exports de `CardReferenceValidator`.
9. **Testes**: estender `deck-workflow.spec.ts` (ou novo spec) — legal/ilegal (main≠50, egg>5, cópia>4, unknown, zona), publish bloqueia ilegal, eggList/cover round-trip.
## Critério de conclusão:
- [ ] `Deck` com eggList+coverCardId; repo Prisma persiste
- [ ] `CheckDeckLegalityUseCase` com as 5 regras; testes cobrindo cada violação
- [ ] Publish exige legalidade
- [ ] `pnpm turbo typecheck --filter=@digimon/decks` passando
- [ ] Lint passando; testes passando (`pnpm turbo test --filter=@digimon/decks`)
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 62` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
- apps/web/src/features/admin/model/session.ts
- apps/web/src/features/auth/viewmodel/use-login-view-model.ts
- apps/web/src/features/auth/viewmodel/use-register-view-model.ts
- apps/web/src/lib/use-session.ts
- context/modules/database/status.md
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
- apps/web/src/lib/session.ts
- context/agents/active/61-backend-cards-deckbuild-fields.md
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/done/60-backend-database-schema-deckbuild-community.md
- context/agents/queue/62-backend-decks-model-legalidade.md
- context/agents/queue/63-backend-decks-import-export.md
- context/agents/queue/64-backend-decks-comunidade.md
- context/agents/queue/65-backend-api-comunidade-decks-routes.md
- context/agents/queue/66-frontend-decks-comunidade.md
- context/agents/queue/67-frontend-admin-moderacao-decks.md
- packages/database/prisma/migrations/20261011120000_deckbuild_community/migration.sql
- packages/database/src/generated/prisma/models/CommunityDeckReport.ts
- packages/database/src/generated/prisma/models/PublicDeck.ts
- packages/database/src/generated/prisma/models/PublicDeckCopy.ts
- packages/database/src/generated/prisma/models/PublicDeckLike.ts
