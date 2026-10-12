# Task: web — gate de dono na página de edição do deck
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx`
## Depende de: [ ] `80-frontend-deck-editar.md`, `81-frontend-gate-member.md`
## Contexto para ler: context/modules/decks/context.md, context/modules/web/context.md, ADR-007
## Skills a carregar: codegen.md + frontend.md
## Problema (pendência da revisão do Lote 10):
`GET /decks/:slug` é público para decks publicados, então um **não-dono** consegue abrir `/decks/{slug}/editar` (o form carrega) e só falha no `PATCH` com 403. Gap de UX: a página de edição deve ser **só do dono**.
## O que fazer:
1. Na página `apps/web/src/app/(member)/decks/[slug]/editar/page.tsx` (já é Server Component sob `(member)`, portanto logada), adicionar **gate de dono**:
   - ler a sessão (`getSession()` de `@/lib/session`);
   - buscar o deck com o **cookie da request** encaminhado (para o dono enxergar o próprio rascunho) — reusar o padrão da task 85;
   - se o deck **não existir** → `notFound()`;
   - se `deck.ownerId !== <id da sessão>` → `redirect('/decks/' + slug)` (não expor o form de edição de terceiros).
2. Não alterar o ViewModel nem a View do form (gate é na página).
3. Manter o gate de `(member)` (login) intacto.
## Especificação:
- Next 16 App Router; `cookies()` async; `redirect`/`notFound` de `next/navigation`.
- Comparar pelo id do usuário da sessão (verificar a forma de `getSession()` em `lib/session.ts`).
## Critério de conclusão:
- [ ] Não-dono em `/decks/{slug}/editar` é redirecionado para `/decks/{slug}` (ou 404)
- [ ] Dono edita normalmente; rascunho do dono é acessível
- [ ] Deck inexistente → notFound
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/decks/status.md`, rodar `pnpm harness finish 86` e registrar o handoff
## Complexidade: baixa

## Baseline (git)
- context/agents/active/84-decks-detalhe-thumb-e-export-png.md
- context/agents/active/85-web-deck-detalhe-ssr-cookie.md
- context/agents/queue/86-web-deck-editar-gate-dono.md
- context/agents/queue/87-cards-filtros-tipagem.md
