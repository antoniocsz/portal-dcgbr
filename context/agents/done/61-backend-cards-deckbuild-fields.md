# Task: @digimon/cards — campos de deckbuild (tipo DigiEgg + limite de cópias)
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/**`
- `apps/api/src/routes/cards.ts`
- `apps/web/src/features/cards/**`
## Depende de: [ ] `60-backend-database-schema-deckbuild-community.md` (o schema já tem `CardType.DIGIEGG` e `Card.maxCountInDeck`)
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md
## Skills a carregar: codegen.md + backend.md + data.md
## O que já existe:
- Módulo `@digimon/cards` com entidade `Card`/`CardSet`, repositórios Prisma, use cases (Import/Get/List/ListSets), schemas Zod, barrel.
- `Card.type` é `CardType = 'digimon' | 'option' | 'tamer'` (domínio do módulo). Prisma `CardType` ganhou `DIGIEGG` no lote 1.
- Rota Fastify `apps/api/src/routes/cards.ts` (`GET /cards`, `GET /cards/sets`, `GET /cards/:id`, `POST /cards/admin/import`).
- Feature web `apps/web/src/features/cards/**` (model/types mirror + viewmodels + views).
## O que criar/alterar:
1. **Domínio**: `CardType` passa a `'digimon' | 'option' | 'tamer' | 'digiegg'`. `Card` ganha `maxCountInDeck: number` (default 4 no `create`). Invariante: `maxCountInDeck >= 0` inteiro.
2. **Schemas de import** (`use-cases/schemas.ts`): aceitar `type: 'digiegg'` e `maxCountInDeck?: number` (default 4).
3. **Infra Prisma** (`prisma-card-repository.ts`): mapear `DIGIEGG` ↔ `'digiegg'` e persistir `maxCountInDeck`.
4. **ListCards**: filtro `type` passa a aceitar `digiegg`.
5. **Rota** `apps/api/src/routes/cards.ts`: DTO serializado ganha `maxCountInDeck`; query `type` inclui `digiegg`.
6. **Feature web** `apps/web/src/features/cards/model/types.ts`: `CardType` ganha `'digiegg'`, `CardSummary`/`Card` ganham `maxCountInDeck: number`; labels (`CARD_TYPE_LABELS`) ganham `digiegg: 'Digi-Egg'`. Ajustar `admin-cards-view`/`card-filters` se necessário para o novo tipo.
7. **Testes**: atualizar/estender os testes unitários do módulo (import com `digiegg` + `maxCountInDeck`; round-trip do Prisma repo via memory repo).
8. **Barrel**: exporta os tipos já existentes — sem novos símbolos obrigatórios; se `CardType`/`Card` já são exportados, nada muda.
## Critério de conclusão:
- [ ] Import aceita `type: 'digiegg'` e `maxCountInDeck`; teste cobre
- [ ] `ListCards` filtra por `digiegg`
- [ ] DTO da rota inclui `maxCountInDeck`
- [ ] Tipos do web alinhados (typecheck)
- [ ] `pnpm turbo typecheck --filter=@digimon/cards --filter=@digimon/app-api` passando
- [ ] Lint passando
- [ ] Testes do módulo passando (`pnpm turbo test --filter=@digimon/cards`)
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 61` e registrar o handoff
## Complexidade: média

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
- context/agents/done/59-frontend-fix-sessao-login.md
- context/agents/done/60-backend-database-schema-deckbuild-community.md
- context/agents/queue/61-backend-cards-deckbuild-fields.md
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
