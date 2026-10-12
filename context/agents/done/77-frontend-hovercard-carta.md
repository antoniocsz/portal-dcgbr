# Task: frontend — hovercard com a imagem da carta
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/components/card-hover-card.tsx` (novo)
- `apps/web/src/components/index.ts`
- `apps/web/src/features/cards/views/cards-grid.tsx`
## Depende de: [ ] —
## Contexto para ler: context/modules/cards/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Ao passar o mouse pela carta deveria mostrar a imagem da carta em um hovercard."
## O que fazer:
1. **Novo componente** `CardHoverCard` (design system, `apps/web/src/components/card-hover-card.tsx`): ao **hover/focus** de um elemento (a carta da grade), exibe um **card flutuante com a imagem grande da carta** (`imageUrl`) em proporção de carta (`aspect-[5/7]`), com nome e número. Sem imagem → fallback textual (nome/número) ou não aparece.
   - Posicionamento: `absolute`/portal, sem cortar na viewport; **só aparece em desktop** (pointer fino) — em touch, não interfere; não bloquear o clique no link.
   - Acessível: aparece em `focus-visible` também; `aria-hidden` quando é redundante (o link já tem nome).
   - `imageUrl` nulo → hovercard com fallback (sem `<img>` quebrada).
2. **Integrar em `cards-grid.tsx`**: envolver cada `CardTile` de forma que o hovercard mostre a arte grande. Usar `imageUrl` do `GridCard` (já disponível via `toCardTileData`).
3. Exportar o componente no barrel `components/index.ts`.
## Critério de conclusão:
- [ ] Hover numa carta da grade mostra a imagem grande num card flutuante; some ao sair
- [ ] Funciona com focus de teclado; sem `<img>` quebrada quando não há `imageUrl`
- [ ] Não quebra o link/clique da carta
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 77` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/next-env.d.ts
- context/agents/active/76-frontend-cartas-filtros-selects.md
- context/agents/queue/77-frontend-hovercard-carta.md
- context/agents/queue/78-frontend-busca-cartas-deck.md
- context/agents/queue/79-frontend-deck-detalhe.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/81-frontend-gate-member.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
