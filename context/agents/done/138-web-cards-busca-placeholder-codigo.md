# Task: web — textos de ajuda da busca de cartas (código da carta/coleção)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/views/deck-form-view.tsx`
- `apps/web/src/features/cards/views/card-filters.tsx`
## Depende de: [ ] — a task 137 (backend) habilita a busca por código, em paralelo
## Contexto para ler: context/modules/web/context.md, context/modules/cards/context.md
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"No input de busca, na parte de buscar carta do criar deck, ele também aceita fazer a busca pelo código da coleção e da carta."
## Especificação (ajuste de UX/texto; a funcionalidade vem da task 137):
1. `deck-form-view.tsx`: atualizar o `placeholder`/texto de ajuda do input de busca (hoje "Nome ou efeito (ex: Agumon, explosão)…") para deixar claro que aceita **código da carta** (`BT1-001`) e **código da coleção** (`BT1`) além de nome/efeito. Manter o `aria-label`.
2. `card-filters.tsx`: alinhar o placeholder do mesmo tipo de busca na listagem pública `/cartas` ("Buscar por nome ou efeito…") para mencionar código/coleção — mesma UX/consistência.
3. Sem mudança de lógica (o termo continua indo para `search`), sem alterar layout, filtros select nem a busca backend.
## Critério de conclusão:
- [ ] Placeholders/ajuda mencionam nome, efeito, código da carta e da coleção
- [ ] `pnpm turbo typecheck --filter=@digimon/app-web` passando
- [ ] `git diff` restrito ao `## Escopo`
## Ao terminar: atualizar `context/modules/web/status.md`, rodar `pnpm harness finish 138` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/135-backend-torneios-agenda-status-publica.md
- context/agents/active/136-web-torneios-filtros-funcionais.md
- context/agents/active/137-backend-cards-busca-por-codigo.md
- context/agents/queue/138-web-cards-busca-placeholder-codigo.md
