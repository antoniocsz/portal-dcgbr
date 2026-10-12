# Task: fix frontend — redesenhar o formulário de criar deck (UX)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/decks/views/deck-form-view.tsx`
- `apps/web/src/features/decks/viewmodels/use-deck-form.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Problema reportado:
"O formulário de criar deck é muito ruim." (=`/decks/novo`, `deck-form-view.tsx`).
## Problemas concretos identificados (corrigir todos):
1. **Slug exposto ao usuário** — campo técnico que deveria ser derivado do nome (só mostrar como informação; opcional avançado).
2. **`<form>` aninhado** — a busca usa um `<form>` dentro do `<form>` principal (HTML inválido, comportamento imprevisível).
3. **Botão "Adicionar" desabilita após 1 cópia** — não há como colocar 4 cópias (o VM `addCard` incrementa, mas a UI desabilita quando `inMain`). Precisa de **controle de quantidade** (+/−) respeitando `maxCountInDeck` (4).
4. **Sem quantidade no deck** — as listas main/egg só mostram "×qty" e "Remover"; falta +/−.
5. **Capa resolve nomes só da busca atual** — `<select>` de capa usa `nameById` (só resultados da busca), então mostra o `cardId` para cartas já no deck. Resolver os nomes das cartas do deck.
6. **Layout:** tudo numa coluna longa e desorganizada. Reorganizar em **duas colunas** (responsivo): esquerda = busca/seleção de cartas; direita = painel do deck (main 50 / egg 5) com contadores, legalidade e capa.
## O que implementar:
- **ViewModel (`use-deck-form.ts`)**:
  - `setQuantity(zone, cardId, qty)`, `incrementCard/addCard` (respeita `maxCountInDeck`), `decrementCard`, `removeCard` — para main e egg.
  - **Índice de cartas** (`Map<cardId, {name, imageUrl, maxCountInDeck, type}>`): atualizado ao adicionar pela busca **e** resolução lazy dos ids vindos de import (`cardsApi.getCard(id)` da feature cards, em cache; aceitável para ~55 ids). Expor `resolveCard(cardId)` p/ as Views nomearem/imagens.
  - Derivar slug automaticamente do nome quando o campo estiver vazio; manter validação.
  - Expor `remainingMain` (50 − total) e `remainingEgg` (5 − total).
- **View (`deck-form-view.tsx`)**:
  - Remover o `<form>` aninhado (busca usa `onKeyDown`/botão, sem form).
  - Campo de busca com **filtros básicos** (tipo/cor) e resultados como **linhas com miniatura da arte** + stepper/“Adicionar” (permite 1..4).
  - Painel do deck em duas colunas main/egg com **steppers +/−**, miniatura, nome, contador e "Remover"; contadores `X/50` e `Y/5` bem visíveis; estados vazios claros.
  - Painel de **legalidade** com violações listadas; painel de import (mantém) e capa com nomes corretos.
  - Ações (Salvar / Salvar e publicar) num rodapé/coluna visível; publicação na comunidade após salvar (mantém o fluxo atual).
  - Esconder o slug do fluxo principal (mostrar como linha secundária/"avançado").
- Manter MVVM estrito (View só JSX; fetch só em Model/ViewModel). Componentes do design system (`CardTile`, `Button`, `StatusBadge`).
## Critério de conclusão:
- [ ] Dá para adicionar até 4 cópias (2 no egg) e ajustar quantidade com +/−
- [ ] Sem `<form>` aninhado; slug não é campo principal; capa mostra nomes corretos
- [ ] Layout em duas colunas responsivo, com contadores e legalidade claros
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-web` passando (MVVM)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 72` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/web/next-env.d.ts
- apps/web/public/dcg-logo.png
- apps/web/src/components/card-tile.tsx
- apps/web/src/components/site-footer.tsx
- apps/web/src/components/site-header.tsx
- apps/web/src/features/cards/views/card-detail-view.tsx
- context/modules/web/status.md
- context/agents/done/71-frontend-fix-ficha-arte-inteira.md
- context/agents/queue/72-frontend-fix-form-deck.md
- context/agents/queue/73-frontend-home-remover-torneios.md
- context/agents/queue/74-assets-logo-transparente.md
