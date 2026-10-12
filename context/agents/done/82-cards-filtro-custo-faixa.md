# Task: cards/api/web — filtro de custo por faixa (0–6 e "7+")
## Agente: `agente-backend`
## Módulo: `packages/modules/cards`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/cards/**`
- `apps/api/src/routes/cards.ts`
- `apps/web/src/features/cards/model/types.ts`
- `apps/web/src/features/cards/views/card-filters.tsx`
## Depende de: [ ] `76-frontend-cartas-filtros-selects.md`
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md
## Skills a carregar: codegen.md + backend.md + data.md + frontend.md
## Contexto:
Hoje o filtro de custo em `/cartas` é **igualdade** (`playCost` exato 0–7). O usuário quer uma faixa com **"7+"**.
## O que fazer (backend):
1. **`ListCardsUseCase`/schemas/repositório**: além de `playCost` (exato), aceitar **faixa**: `minPlayCost` e/ou `maxPlayCost` (inteiros). No repositório Prisma, aplicar `gte`/`lte` quando presentes; manter `playCost` exato por compatibilidade.
2. **Rota `GET /cards`** (`apps/api/src/routes/cards.ts`): aceitar `minPlayCost`/`maxPlayCost` na query e repassar.
3. **Testes**: faixa (ex.: `minPlayCost=7` retorna custo ≥ 7; `max=2` etc.), sem rede.
## O que fazer (frontend):
4. **`model/types.ts`**: `ListCardsParams` ganha `minPlayCost?`/`maxPlayCost?`.
5. **`card-filters.tsx`** (select de custo, task 76): opções **0,1,2,3,4,5,6 e "7+"** → "7+" envia `minPlayCost=7`; as demais enviam `maxPlayCost=<n>` (ou `min=max=n`).
## Critério de conclusão:
- [ ] API aceita faixa de custo (`minPlayCost`/`maxPlayCost`); testes passando
- [ ] Select de custo com "7+" funcionando em `/cartas`
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/cards --filter=@digimon/app-api --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 82` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/src/app/(member)/layout.tsx
- apps/web/src/components/index.ts
- apps/web/src/features/cards/views/card-filters.tsx
- apps/web/src/features/cards/views/cards-grid.tsx
- apps/web/src/features/decks/viewmodels/use-deck.ts
- apps/web/src/features/decks/views/deck-detail-view.tsx
- apps/web/src/features/decks/views/deck-form-view.tsx
- context/modules/cards/status.md
- context/modules/decks/status.md
- context/modules/web/status.md
- apps/web/src/app/(public)/decks/[slug]/page.tsx
- apps/web/src/components/card-hover-card.tsx
- apps/web/src/features/cards/viewmodels/use-card-search.ts
- context/agents/active/80-frontend-deck-editar.md
- context/agents/done/76-frontend-cartas-filtros-selects.md
- context/agents/done/77-frontend-hovercard-carta.md
- context/agents/done/78-frontend-busca-cartas-deck.md
- context/agents/done/79-frontend-deck-detalhe.md
- context/agents/done/81-frontend-gate-member.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
