# Task: frontend — página de detalhe do deck (`/decks/[slug]`)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(public)/decks/[slug]/page.tsx` (novo)
- `apps/web/src/features/decks/views/deck-detail-view.tsx`
- `apps/web/src/features/decks/views/index.ts`
- `apps/web/src/features/decks/viewmodels/use-deck.ts`
## Depende de: [ ] —
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## Pedido do usuário:
"Não tem tela de detalhes do deck?" — hoje a lista linka para `/decks/{slug}`, que **não existe (404)**. O `DeckDetailView` existe em `features/decks/views` mas **nenhuma rota o usa**, e ele é básico (mostra só `cardId ×qty`).
## O que fazer:
1. **Criar a rota** `apps/web/src/app/(public)/decks/[slug]/page.tsx` (client view hidratada; `generateMetadata` opcional com o nome do deck se der para buscar SSR — senão metadata simples). Renderiza `<DeckDetailView slug={slug} />`.
2. **Reescrever `deck-detail-view.tsx`** para um detalhe completo, reusando o que já existe:
   - Cabeçalho: nome, `StatusBadge` (draft/publicado), formato, contagem (main/egg), descrição, dono (`ownerId` → nome via `/users/:id` se houver, senão omitir) e **capa** (`coverCardId`) usando `CardTile`.
   - **Decklist em seções** (reusa `viewmodels/deck-sections.ts`): Eggs → Digimon por nível → Tamers → Options → Outros, com **nome + miniatura + quantidade** (resolver `cardId` → carta via um índice/`useQueries` sobre `cardsApi.getCard`, como no form) e **hovercard** (`CardHoverCard`, task 77) opcional.
   - **Legalidade** (reusa `POST /decks/legality`) com badge e violações.
   - **Ações por papel** (usar `useSession` para saber o dono):
     - Dono: **Editar** (link `/decks/{slug}/editar` — task 80), Publicar (se draft), Publicar na comunidade (`useDeckPublications`), Exportar (texto/PNG), Excluir (confirmar).
     - Não-dono: Copiar deck.
   - Estados loading/erro/404 claros.
3. `use-deck.ts`: ajustar se necessário (expor `refetch` já existe). Não usar `useQuery` na View.
4. Atualizar `views/index.ts` se mudar assinatura.
## Especificação:
- MVVM estrito; não importar `@digimon/decks` no client.
- O `GET /decks/:slug` retorna 404 para rascunho de outro usuário — a View deve mostrar "não encontrado" sem vazar.
## Critério de conclusão:
- [ ] `/decks/{slug}` abre o detalhe (sem 404) com nomes/imagens das cartas (main + egg) e capa
- [ ] Ações do dono (Editar/Publicar/Excluir/Exportar) e do visitante (Copiar) coerentes
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 79` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/web/src/app/(member)/layout.tsx
- apps/web/src/components/index.ts
- apps/web/src/features/cards/views/card-filters.tsx
- apps/web/src/features/cards/views/cards-grid.tsx
- context/modules/web/status.md
- apps/web/src/components/card-hover-card.tsx
- context/agents/active/78-frontend-busca-cartas-deck.md
- context/agents/done/76-frontend-cartas-filtros-selects.md
- context/agents/done/77-frontend-hovercard-carta.md
- context/agents/done/81-frontend-gate-member.md
- context/agents/queue/79-frontend-deck-detalhe.md
- context/agents/queue/80-frontend-deck-editar.md
- context/agents/queue/82-cards-filtro-custo-faixa.md
- context/agents/queue/83-web-next-image-setscount.md
