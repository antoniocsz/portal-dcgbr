# Task: web — next/image para a arte das cartas + espelhar setsCount
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/next.config.ts`
- `apps/web/src/components/card-tile.tsx`
- `apps/web/src/components/card-hover-card.tsx`
- `apps/web/src/features/cards/views/card-detail-view.tsx`
- `apps/web/src/features/cards/model/types.ts`
## Depende de: [ ] `77-frontend-hovercard-carta.md`
## Contexto para ler: context/modules/web/context.md, context/modules/cards/context.md
## Skills a carregar: codegen.md + frontend.md
## O que fazer:
1. **`next.config.ts`**: adicionar `images.remotePatterns` para o host da arte oficial das cartas: `world.digimoncard.com` (path `/images/cardlist/card/**`). (Se o projeto já tiver config de imagens, estender.)
2. **Migrar a arte das cartas para `next/image`** (otimização): `card-tile.tsx`, `card-hover-card.tsx` e `card-detail-view.tsx` — trocar `<img>` por `<Image>` com `width`/`height` (ou `fill` + container com `aspect-[5/7]`/`relative`) e `sizes` adequado. Manter **o fallback** em ausência/erro de `imageUrl` (o `onError` do `next/image`/client component).
   - Atenção: componentes que usam `onError` precisam ser client components (já são).
3. **Espelhar o contrato** (`apps/web/src/features/cards/model/types.ts`): adicionar `setsCount?: number` ao tipo `ImportCardsFromSourceResult` (o backend já retorna `setsCount` — corrige o drift apontado na revisão).
## Critério de conclusão:
- [ ] `remotePatterns` configurado; arte das cartas servida via `next/image`
- [ ] Fallback preservado (sem arte / erro)
- [ ] `ImportCardsFromSourceResult` inclui `setsCount?`
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 83` e registrar o handoff
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
- context/agents/active/82-cards-filtro-custo-faixa.md
- context/agents/done/76-frontend-cartas-filtros-selects.md
- context/agents/done/77-frontend-hovercard-carta.md
- context/agents/done/78-frontend-busca-cartas-deck.md
- context/agents/done/79-frontend-deck-detalhe.md
- context/agents/done/81-frontend-gate-member.md
- context/agents/queue/83-web-next-image-setscount.md
