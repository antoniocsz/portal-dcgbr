# Task: cards — amarrar a tipagem dos filtros de custo no ViewModel
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/cards/viewmodels/use-card-list.ts`
- `apps/web/src/features/cards/views/card-filters.tsx`
## Depende de: [ ] `76-frontend-cartas-filtros-selects.md`, `82-cards-filtro-custo-faixa.md`
## Contexto para ler: context/modules/cards/context.md
## Skills a carregar: codegen.md + frontend.md
## Problema (pendência da revisão do Lote 10):
O filtro de custo por faixa (`minPlayCost`/`maxPlayCost`) foi feito com `FilterState = CardFilters & Pick<ListCardsParams,'minPlayCost'|'maxPlayCost'>` na View, enquanto `useCardList` mantém `filters: CardFilters` (sem os campos de faixa). Funciona por campos opcionais/contravariância, mas é dívida: o ViewModel não documenta a faixa no seu tipo de estado.
## O que fazer:
1. **`use-card-list.ts`**: incluir `minPlayCost?`/`maxPlayCost?` no tipo `CardFilters` (estado do VM) e garantir que sejam propagados em `params` (o VM já espalha `...filters` — confirmar). Manter `playCost` exato se ainda existir.
2. **`card-filters.tsx`**: usar o tipo `CardFilters` do VM diretamente (remover o `FilterState`/`Pick` ad hoc, se agora redundante), mantendo o comportamento do select de custo ("7+" → `minPlayCost=7`; 0–6 → faixa exata).
3. Sem mudança de comportamento visual.
## Critério de conclusão:
- [ ] `CardFilters` (VM) tipa `minPlayCost`/`maxPlayCost`; View usa o tipo do VM
- [ ] Select de custo continua funcionando end-to-end
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 87` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/84-decks-detalhe-thumb-e-export-png.md
- context/agents/active/85-web-deck-detalhe-ssr-cookie.md
- context/agents/active/86-web-deck-editar-gate-dono.md
- context/agents/queue/87-cards-filtros-tipagem.md
