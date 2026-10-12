# Task: Schema Prisma — campos de deckbuild (cards/decks) + tabelas da comunidade de decks
## Agente: `agente-backend`
## Módulo: `packages/database`
## Escopo (arquivos que esta task vai tocar):
- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/**`
- `packages/database/src/generated/**`
- `packages/database/src/index.ts`
## Depende de: [ ] — (primeira task; nada depende dele antes)
## Contexto para ler: context/modules/database/context.md, context/modules/cards/context.md, context/modules/decks/context.md
## Skills a carregar: codegen.md + backend.md + data.md
## O que já existe:
- `packages/database/prisma/schema.prisma` com `Deck` (cardList Json, format, status DeckStatus DRAFT|PUBLISHED, isPublic), `DeckCopy`, `Card` (type CardType DIGIMON|OPTION|TAMER), `CardSet`, `Comment`.
- Prisma 7 com generator `prisma-client` e output LOCAL em `packages/database/src/generated/prisma` (versionado no git).
- Migrations em `packages/database/prisma/migrations/<timestamp>_<nome>/migration.sql` (ex.: `20260930160854_cards`, `20260930180000_decks`).
- IDs do projeto usam `cuid()`. **Não usar uuid.**
## O que criar (SCHEMA-FIRST: esta task prepara o banco para os lotes 2–7):
1. **Cards** — enriquecer para deckbuild:
   - `enum CardType` ganha `DIGIEGG` (ficando `DIGIMON | OPTION | TAMER | DIGIEGG`).
   - `model Card` ganha `maxCountInDeck Int @default(4)` (limite de cópias por carta; default 4).
2. **Decks** — modelo de lista dupla + capa:
   - `model Deck` ganha `eggList Json @default("[]")` (lista de cartas de Digi-Egg) e `coverCardId String?` (carta de capa).
3. **Comunidade** — novas tabelas (snapshot congelado + engajamento + moderação):
   - `enum PublicDeckStatus { PUBLIC HIDDEN UNPUBLISHED }`
   - `model PublicDeck` (`public_decks`): id cuid, `accountId` → User, `sourceDeckId` → Deck (onDelete Cascade), `name`, `colors Json @default("[]")`, `cardList Json`, `eggList Json @default("[]")`, `coverCardId String?`, `likeCount Int @default(0)`, `copyCount Int @default(0)`, `status PublicDeckStatus @default(PUBLIC)`, `publishedAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `@@unique([accountId, sourceDeckId])`, índices `[status, likeCount]`, `[status, publishedAt]`.
   - `model PublicDeckLike` (`public_deck_likes`): `@@unique([publicDeckId, accountId])`, FK Cascade p/ PublicDeck, FK account.
   - `model PublicDeckCopy` (`public_deck_copies`): `@@unique([publicDeckId, accountId])`, FK Cascade, `createdAt`.
   - `model CommunityDeckReport` (`community_deck_reports`): `publicDeckId` FK Cascade, `reporterAccountId String?` → User onDelete SetNull, `reason String`, `details String?`, `createdAt`, `dismissedAt DateTime?`, índice `[publicDeckId, dismissedAt]`.
   - Relações no `User`: `publicDecks PublicDeck[] @relation("PublicDecks")`, `publicDeckLikes PublicDeckLike[] @relation("PublicDeckLikes")`, `publicDeckCopies PublicDeckCopy[] @relation("PublicDeckCopies")`, `deckReports CommunityDeckReport[] @relation("DeckReports")`.
   - `Deck` ganha `publications PublicDeck[]`.
4. **Migration** `packages/database/prisma/migrations/<timestamp>_deckbuild_community/migration.sql` com todo o DDL (ALTER dos enums/tabelas existentes + CREATE TABLEs + índices + FKs). Seguir o padrão das migrations existentes do projeto.
5. Rodar `pnpm --filter @digimon/database run generate` para regenerar o client local (`src/generated/prisma`) — incluir os arquivos gerados no escopo (já incluídos).
6. Atualizar o barrel `packages/database/src/index.ts` para exportar os novos tipos/enums seguindo o padrão atual (só se o barrel já exporta tipos de modelo/enum).
## Especificação:
- Não alterar arquivos de módulos (`packages/modules/**`) nesta task — só o schema, a migration, o client gerado e o barrel do database.
- `cardList`/`eggList` continuam `Json` (lista de `{ cardId, quantity }`).
- Cuid em todos os ids; nomes de tabela via `@@map` em snake_case.
## Critério de conclusão:
- [ ] `schema.prisma` válido; `prisma generate` executa sem erro (client regenerado)
- [ ] migration SQL criada cobrindo todas as mudanças acima
- [ ] `pnpm turbo typecheck --filter=@digimon/database` passando
- [ ] `pnpm turbo lint --filter=@digimon/database` passando
- [ ] Barrel atualizado (se aplicável)
## Ao terminar: atualizar `context/modules/database/status.md`, rodar `pnpm harness finish 60` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/src/app/(auth)/login/page.tsx
- apps/web/src/app/(auth)/registro/page.tsx
- apps/web/src/features/admin/model/session.ts
- apps/web/src/features/auth/viewmodel/use-login-view-model.ts
- apps/web/src/features/auth/viewmodel/use-register-view-model.ts
- apps/web/src/lib/use-session.ts
- context/modules/web/status.md
- apps/web/src/lib/session.ts
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/queue/60-backend-database-schema-deckbuild-community.md
- context/agents/queue/61-backend-cards-deckbuild-fields.md
- context/agents/queue/62-backend-decks-model-legalidade.md
- context/agents/queue/63-backend-decks-import-export.md
- context/agents/queue/64-backend-decks-comunidade.md
- context/agents/queue/65-backend-api-comunidade-decks-routes.md
- context/agents/queue/66-frontend-decks-comunidade.md
- context/agents/queue/67-frontend-admin-moderacao-decks.md
