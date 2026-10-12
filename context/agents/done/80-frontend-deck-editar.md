# Task: frontend — página de editar o deck (`/decks/[slug]/editar`)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (novo)
- `apps/web/src/features/decks/views/deck-form-view.tsx`
- `apps/web/src/features/decks/viewmodels/use-deck-form.ts`
## Depende de: [ ] `78-frontend-busca-cartas-deck.md`, `79-frontend-deck-detalhe.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Não tem tela de ... editar o deck?" — não existe edição. A API já expõe `PATCH /decks/:slug` (`decksApi.updateDeck`).
## O que fazer:
1. **Modo edição no `use-deck-form.ts`**: aceitar `{ mode: 'create' | 'edit', slug?, initialDeck? }`. Em edit:
   - carregar o deck (`decksApi.getDeck`) e preencher `values` (nome/descrição/formato), `cardList`, `eggList`, `coverCardId`;
   - `handleSubmit` usa `decksApi.updateDeck(slug, input)` em vez de `createDeck`;
   - `reset`/`isLoading` adequados; demais regras (legalidade, steppers, import) permanecem.
2. **`deck-form-view.tsx`**: aceitar props de edição (`mode`/`slug`) e ajustar títulos/CTAs ("Salvar alterações"); manter o layout 2 colunas (task 72) e a busca acumulada (task 78). Botão de publicar na comunidade continua para decks salvos.
3. **Criar a rota** `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx`: container largo (padrão da task 75), cabeçalho "Editar deck" e o form em modo edit. Sem `AuthShell` estreito (gate de Member é do grupo `(member)` — task 81).
4. Após salvar, redirecionar para `/decks/{slug}` (detalhe).
## Especificação:
- MVVM estrito; reusar `decksApi.updateDeck`.
- Não quebrar o fluxo de criação (`mode: 'create'` default).
## Critério de conclusão:
- [ ] `/decks/{slug}/editar` carrega o deck, permite editar cartas (main/egg), capa e metadados, e salva via PATCH
- [ ] Fluxo de criação continua funcionando
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 80` e registrar o handoff
## Complexidade: alta

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
- context/agents/done/76-frontend-cartas-filtros-selects.md
- context/agents/done/77-frontend-hovercard-carta.md
- context/agents/done/78-frontend-busca-cartas-deck.md
- context/agents/done/79-frontend-deck-detalhe.md
- context/agents/done/81-frontend-gate-member.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
