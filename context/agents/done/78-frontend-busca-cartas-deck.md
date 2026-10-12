# Task: frontend — busca de cartas do criar-deck: carregar mais + relacionados
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/views/deck-form-view.tsx`
- `apps/web/src/features/decks/viewmodels/use-deck-form.ts`
- `apps/web/src/features/cards/viewmodels/use-card-search.ts` (novo)
## Depende de: [ ] —
## Contexto para ler: context/modules/decks/context.md, context/modules/cards/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"A busca de cartas em criar decks **não mostra todas as cartas relacionadas** e **não dá refresh para ir trazendo mais opções**."
## Causa atual:
O form usa `useCardList` (feature cards) com `pageSize=24` e **sem paginação/infinite** — só mostra a 1ª página e não há como carregar mais.
## O que fazer:
1. **Novo ViewModel** `apps/web/src/features/cards/viewmodels/use-card-search.ts`: busca paginada com **"Carregar mais"** (ou infinite scroll) — acumula páginas (ex.: `pageSize=24`, append), expõe `{ cards, isLoading, isFetchingMore, hasMore, loadMore, search, filters, setFilters, reset }`. Reusa `cardsApi.listCards` e o total para saber se há mais.
2. **`deck-form-view.tsx`**: substituir `useCardList` por `useCardSearch`; manter os filtros (tipo/cor/set) e a busca por nome/efeito; listar **resultados acumulados** com botão **"Carregar mais"** no fim da lista (quando `hasMore`); mostrar contagem (ex.: "mostrando X de Y").
3. Mostrar **mais opções relacionadas**: garantir que a busca por nome traga todas as cartas cujo nome/efeito contém o termo (full-text já suporta) e que a lista default (sem termo) permita navegar carregando mais páginas.
4. Integrar o **hovercard** (`CardHoverCard`, task 77) nos resultados, se disponível.
5. MVVM: nada de `useQuery`/fetch na View; a View usa o ViewModel.
## Critério de conclusão:
- [ ] Busca acumula resultados com "Carregar mais" (sem termo e com termo)
- [ ] Mostra contagem e respeita filtros (tipo/cor/set) + reset para a 1ª página
- [ ] Adicionar/steppers (task 72) continuam funcionando
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, `context/modules/decks/status.md` e `context/modules/cards/status.md`, rodar `pnpm harness finish 78` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/src/app/(member)/layout.tsx
- apps/web/src/components/index.ts
- apps/web/src/features/cards/views/card-filters.tsx
- apps/web/src/features/cards/views/cards-grid.tsx
- context/modules/web/status.md
- apps/web/src/components/card-hover-card.tsx
- context/agents/done/76-frontend-cartas-filtros-selects.md
- context/agents/done/77-frontend-hovercard-carta.md
- context/agents/done/81-frontend-gate-member.md
- context/agents/queue/78-frontend-busca-cartas-deck.md
- context/agents/queue/79-frontend-deck-detalhe.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
