# @digimon/decks — Status

## Fase 1 — Fundação
- [x] Domain entities (Deck + DeckCopy + slugify + invariantes)
- [x] Repository interfaces (DeckRepository + CardReferenceValidator — DIP)
- [x] Use cases (DIP): create / update / publish / delete / get / list / copy
- [x] Implementação Prisma (PrismaDeckRepository)
- [x] Testes unitários (deck-workflow.spec.ts — 22 testes)
- [ ] Testes de integração (pendente: exigem Postgres real; cobertos pelos testes de domínio + rotas + smoke test)

## Fase 2 — Refinamentos
- [x] Integração de eventos (EventBus: created / updated / published / copied)
- [x] Rotas HTTP (apps/web/src/app/api/decks/**)
- [x] UI/frontend (MVVM: features/decks)
- [x] Typecheck: ✅ `pnpm turbo typecheck`
- [x] Lint: ✅
- [x] Testes: ✅ 22 passed

## Fase 3 — Gestão admin (task 16-rota-admin-decks)
- [x] `DeleteDeckUseCase` com override de dono no DOMÍNIO: Admin/Editor (papéis globais, ADR-004) excluem QUALQUER deck; Member não-dono segue ForbiddenError
- [x] `ListDecksUseCase`: actor admin/editor ignora `publicOnly` (vê rascunhos + published + unlisted) com filtro de status opcional; público/member mantêm comportamento atual
- [x] Rotas admin: `GET /api/admin/decks` (administrator|editor) e `DELETE /api/admin/decks/:slug` (administrator)
- [x] Feature admin `use-admin-decks`/`AdminDecksView`/`adminDecksApi` usando as rotas admin (sem fallback por autoria) + filtro de status
- [x] Testes: 26 passed (4 novos: admin deleta deck de outro; editor deleta deck de outro; admin vê todos os status; editor filtra por status)
- [x] Typecheck: ✅ | Lint: ✅ | Testes: ✅ 26 passed

## Handoff

### Handoff task 16 (rota admin de decks)
- **Override admin no domínio (defense in depth):** `DeleteDeckUseCase.execute` autoriza delete se `actor.role === 'administrator' || 'editor'` OU `requireOwner(actor, deck.ownerId)` — a rota admin também exige o papel, mas a regra vive no use case (nenhum caller "comum" consegue escalar privilégio).
- **Listagem admin:** `ListDecksUseCase` passa a distinguir 3 caminhos — `mine` (dono, qualquer status), manager (admin/editor, TODOS os status/visibilidade, com filtro opcional) e público (published E isPublic, comportamento inalterado).
- **Rotas novas:** `GET /api/admin/decks` (exige administrator|editor; reusa `ListDecksUseCase` + `_lib` de `api/decks`) e `DELETE /api/admin/decks/:slug` (exige administrator; reusa `DeleteDeckUseCase`). Sem `new PrismaClient` — DIP via container `api/decks/_lib/container.ts`.
- **Feature admin sem fallback:** `adminDecksApi` → `/api/admin/decks` + `/api/admin/decks/:slug` (DELETE); `useAdminDecks` ganhou `status` filter (`AdminStatusFilter = 'all' | DeckStatus`) e trocou `currentUserId` por `currentRole` (perfil `/me`); `AdminDecksView` mostra filtros Todos/Rascunhos/Publicados, badge "Unlisted" e botão Excluir apenas para administrator.
- **Testes (deck-workflow.spec.ts, 22 → 26):** admin deleta deck de outro ✅; editor deleta deck de outro ✅; admin vê rascunhos/unlisted ✅; editor vê todos e filtra por status ✅; member não-dono continua ForbiddenError ✅ (teste existente mantido).
- **Barrel `packages/modules/decks/src/index.ts`:** sem mudança necessária — as formas de `DeleteDeckCommand`/`ListDecksCommand` não mudaram (nenhum símbolo novo).

### Decisões (task 16)
- Override admin implementado **inline nos use cases** (`MANAGER_ROLES: readonly Role[] = ['administrator', 'editor']` + `isManager`) em vez de no `domain/actor.ts` (padrão do módulo tournaments) porque `actor.ts` está fora do `## Escopo` — "ajuste mínimo" conforme a spec.
- `GET /api/admin/decks` exige administrator|editor (mesmo gate do layout admin); `DELETE` exige apenas administrator (spec): editor vê a agenda completa mas não exclui (UI oculta o botão; backend revalida 403).
- Rotas admin reutilizam `_lib/{handlers,serialize,container,session}` de `api/decks` (mesmo padrão de `api/cards/admin` → `api/cards/_lib`) — sem duplicação de composition root.
- Admin vê "todos" (sem default de status) quando não filtra — diferente do padrão tournaments que faz default `published` para editorial.

### Pendências
- [ ] Testes de integração com Postgres real (não cobertos nesta task; cobertos pelos testes de domínio + rotas + smoke test)
- [ ] `admin/decks` segue com a view sem fallback por autoria — validar visualmente no painel (rotas reais exigem sessão admin/editor)

### Histórico (task 06 + task 13)
- **Task 06 (módulo decks):** Migration `20260930180000_decks` (fluxo seguro: migrate diff + psql + registro em `_prisma_migrations`) — tabelas `decks` e `deck_copies` + enum `DeckStatus` + índice GIN `decks_search_idx` (ADR-003); `prisma migrate status` = up to date. Rotas API: `GET/POST /api/decks`, `GET/PATCH/DELETE /api/decks/:slug`, `POST /api/decks/:slug/publish`, `POST /api/decks/:slug/copy`, `GET /api/decks?mine=true`. UI MVVM: model (types + decks-api), viewmodels (list, detail, form, actions), views (lista com DeckCard + copiar, form com salvar/publicar, detalhe com cardList). CardReferenceValidator implementado no composition root (apps/web) via Prisma — valida existência das cartas do cardList contra a tabela `cards`. Adicionada dependência `@digimon/decks` em `apps/web/package.json` (necessária aos route handlers; segue o padrão das tasks 05/07). Barrel export do módulo e do `@digimon/database` (Deck, DeckCopy, DeckStatus) atualizados. `.gitkeep` antigo de `features/decks` mantido (baseline).
- **Task 13 (páginas decks):** `(public)/decks` — `DecksListView` virou grid responsivo (1-col mobile → 2/3/4-col desktop) com `DeckCard` + ícone de copiar direto no card (via `onCopy`), estados loading/erro/vazio e botão "+ Novo deck" (headerAction → `/decks/novo`). `(member)/decks/novo` — `DeckFormView` ganhou busca de cartas do catálogo (reusa `useCardList` da feature cards; resultados com "Adicionar" alimentam o cardList via `addCard(card.id)`), mantendo nome/slug/formato/descrição + salvar/publicar. Página monta `AuthShell` + `AuthBenefits` (layout do design "Criar deck": card 420px + painel). **Decisão:** busca de cartas usa `useCardList` (ViewModel de outra feature — consumo de ViewModel entre features é permitido; Model não foi duplicado).

### Decisões (histórico task 06)
- `/me/decks` (spec original) implementado como `GET /api/decks?mine=true` para respeitar o escopo `apps/web/src/app/api/decks/**` (mesma decisão do módulo tournaments)
- Frontend NÃO importa `@digimon/decks` no client (evita arrastar `@digimon/database` ao bundle) — tipos literais mantidos em sync (mesma decisão das features content/tournaments)
- Member publica deck direto (status `published` no create ou via publish) conforme spec; publicar exige ao menos uma carta no cardList
- Deck copiado vira **rascunho** do copiador (nunca publicado automaticamente); slug único gerado com sufixo numérico em colisão
- Deck `unlisted` (published + isPublic=false) não aparece na listagem pública nem é legível por outros — visível só ao dono