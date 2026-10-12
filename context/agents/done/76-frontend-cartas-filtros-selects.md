# Task: frontend — filtros de /cartas como selects (não botões)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/cards/views/card-filters.tsx`
## Depende de: [ ] —
## Contexto para ler: context/modules/cards/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Os filtros em /cartas devem ser **selects** em vez de botões."
## O que fazer:
1. Trocar os grupos de botões (tipo, cor) — e o filtro de **set**/**custo** já existentes — por **`<select>`** (com opção "Todos"/vazio para limpar). Manter a **busca** por nome/efeito como input (com submit).
2. Manter o comportamento atual: qualquer mudança de filtro volta para a página 1 (via `useCardList`/`setFilters`); o filtro de set só aparece se houver sets (`useCardSets`).
3. Acessibilidade: `label` associado (`htmlFor`/`id`), `aria-label`; visual alinhado ao design system.
4. Não mudar a lógica do ViewModel `use-card-list` (só a View) — o VM já aceita `type/color/playCost/setCode/search`.
## Critério de conclusão:
- [ ] Tipo, cor, set e custo são `<select>` (não botões); busca continua input
- [ ] Mudança de filtro reseta para a página 1
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 76` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- apps/web/next-env.d.ts
- context/agents/queue/76-frontend-cartas-filtros-selects.md
- context/agents/queue/77-frontend-hovercard-carta.md
- context/agents/queue/78-frontend-busca-cartas-deck.md
- context/agents/queue/79-frontend-deck-detalhe.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/81-frontend-gate-member.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
