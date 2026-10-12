# Task: @digimon/decks — import/export de decklist (texto + Tabletop Simulator)
## Agente: `agente-backend`
## Módulo: `packages/modules/decks`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/decks/**`
## Depende de: [ ] `62-backend-decks-model-legalidade.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/decks/status.md
## Skills a carregar: codegen.md + backend.md
## Referência (conceito do projeto análogo `aegis-digimon-tcg`): `parseDeckList`/`serializeDeckList` em `apps/web/src/game/decks.ts`.
## O que já existe:
- `Deck` com `cardList` + `eggList` (`{cardId, quantity}[]`), `CardReferenceValidator`.
- Cartas do `@digimon/cards` têm `number` (ex.: `BT1-009`) e `dcgId`.
## O que criar (domínio puro, sem I/O — funções puras onde possível):
1. **Parser `parseDeckList(text): DeckListParseResult`**:
   - Aceita **lista de texto** (uma carta por linha, qualquer ordem):
     - `4 Agumon BT1-009` (DigimonCard.io / digimoncard.app / DCGO)
     - `4 Agumon (DCG) (BT1-009)` (Untap)
     - `BT1-009 Agumon 4` (ordem custom)
     - Ignorar linhas `//` e `#` e linhas sem código de carta.
     - Contagem: prefixo (`4 Agumon`), sufixo (`Agumon 4`) ou `4x`/`x4`; default 1.
   - Aceita **código Tabletop Simulator**: array JSON de códigos (`["Exported from digimonmeta.com","BT1-009",...]`), uma cópia por item; ler as strings por regex (tolerante a colchete faltando).
   - Normaliza código: uppercase e remove zeros à esquerda do set (`ST01-01` → `ST1-01`); preserva sufixo de arte `_P1` (removido para achar a carta, guardado à parte se útil).
   - Regex de código: `/\b([A-Z]{1,3}\d{0,2}-\d{2,3})(?:_P\d+)?\b/gi`.
   - Resolve código → `cardId` via um resolvedor injetado (DIP): `interface DeckCardResolver { resolveByNumber(number: string): Promise<{ cardId: string; isDigiEgg: boolean } | undefined> }`. Cartas desconhecidas → contabilizadas em `skipped`.
   - Digi-Eggs vão para `eggList`; demais para `cardList`. Aplicar caps (main 50 / egg 5) e `maxCountInDeck`; excedentes em `trimmed`.
   - Retorna `{ cardList, eggList, skipped, trimmed }`.
2. **Serializer `serializeDeckList(deck): string`** no formato DigimonCard.io:
   - `// DigimonCard.io Deck List`, egg antes do main, agrupados e ordenados por `number`, linhas `<qty> <name> <number>`.
3. **Use cases** (opcional, se o padrão do módulo pedir): `ImportDeckListUseCase` (text → cardList/eggList, no deck) e `ExportDeckListUseCase` (deck → text). Se ficar mais simples, expor as funções puras + resolver no barrel.
4. **Barrel**: exportar `parseDeckList`, `serializeDeckList`, tipos e o `DeckCardResolver`.
5. **Testes** (`deck-list.spec.ts`): formato texto (3 ordens), TTS JSON, comentários ignorados, normalização `ST01-01`, digit egg p/ eggList, skipped/trimmed, cap 50/5/4, round-trip serialize→parse.
## Especificação:
- Não tocar `apps/api`/`apps/web` nesta task (só o módulo). O resolvedor concreto (Prisma, via `@digimon/cards`) será plugado nas rotas (lote 5/6) — nesta task, só a interface + testes com fake.
- Funções puras para parsing/serialização; sem `new PrismaClient`.
## Critério de conclusão:
- [ ] `parseDeckList` cobre os 3 formatos + TTS + comentários + normalização + skipped/trimmed/caps
- [ ] `serializeDeckList` round-trip com `parseDeckList`
- [ ] `pnpm turbo typecheck --filter=@digimon/decks` passando
- [ ] Lint + testes passando
## Ao terminar: atualizar `context/modules/decks/status.md`, rodar `pnpm harness finish 63` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/api/src/container.ts
- apps/api/src/routes/cards.ts
- apps/api/src/routes/decks.ts
- apps/web/next-env.d.ts
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
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
- packages/modules/decks/src/use-cases/check-deck-legality.ts
