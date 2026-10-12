# @digimon/tournaments — Status

## Fase 1 — Fundação
- [x] Domain entities (Tournament + slugify + invariantes)
- [x] Repository interfaces (TournamentRepository)
- [x] Use cases (DIP): create / update / cancel / add-results / get / list
- [x] Implementação Prisma (PrismaTournamentRepository)
- [x] Testes unitários (tournament-workflow.spec.ts — 16 testes)
- [ ] Testes de integração (pendente: exigem Postgres real; cobertos pelos testes de domínio + rotas)

## Fase 2 — Refinamentos
- [x] Integração de eventos (EventBus: created / updated / cancelled / results.added)
- [x] Rotas HTTP (apps/web/src/app/api/tournaments/**)
- [x] UI/frontend (MVVM: features/tournaments)
- [x] Typecheck: ✅ `pnpm turbo typecheck`
- [x] Lint: ✅
- [x] Testes: ✅ 16 passed

## Handoff
### Feito
- Rotas API: `GET/POST /api/tournaments`, `GET/PATCH/DELETE /api/tournaments/:slug`, `POST /api/tournaments/:slug/results`, `GET /api/tournaments?mine=true`
- UI MVVM: model (types + tournaments-api), viewmodels (list, detail, form, actions), views (lista com TournamentCard + form de criar)
- Corrigido typecheck pendente do domínio (spec: string vs Date) e 3 warnings de max-len
- Adicionada dependência `@digimon/tournaments` em `apps/web/package.json` (necessária aos route handlers; segue o padrão da task 05 com `@digimon/cards`)

### Pendências
- [x] Páginas `(public)/torneios` e `(member)/torneios/novo` → task 13 (frontend-cards-decks-torneios)
- [x] `admin/torneios` (gestão) → task 13
- Testes de integração com Postgres real (não cobertos nesta task)
- Barrel das views/viewmodels da feature prontos; `.gitkeep` antigo de `features/tournaments` mantido (baseline)

### Handoff task 13 (páginas torneios)
- **`(public)/torneios`:** `TournamentsListView` agora exibe sempre os filtros por status (Todos/Próximos/Finalizados/Cancelados, lidos de `?status=`), botão "+ Publicar torneio" (headerAction → `/torneios/novo`). Nota: a API pública só expõe `published` — o filtro tem efeito real para Admin/Editor e em "meus torneios".
- **`(member)/torneios/novo`:** página monta `AuthShell` + `AuthBenefits` (design "Criar torneio") com `TournamentFormView` (form completo nome/slug/formato/local/datas + publicar).
- **`admin/torneios`:** novo `useAdminTournaments` + `AdminTournamentsView` — agenda completa (filtro por status funciona porque o backend identifica Admin/Editor), tabela `AdminTable` (Torneio/Data/Formato·Local/Status/Ações: ver + cancelar via `DELETE /api/tournaments/:slug`), paginação. Barrels atualizados.

### Decisões
- `/me/tournaments` (spec original) implementado como `GET /api/tournaments?mine=true` para respeitar o escopo `apps/web/src/app/api/tournaments/**`
- Frontend NÃO importa `@digimon/tournaments` no client (evita arrastar `@digimon/database` ao bundle) — tipos literais mantidos em sync (mesma decisão da feature content)
- Member publica torneio direto (status `published`, sem revisão) conforme spec

## Fase 3 — Rotas na API separada (`apps/api`, task 42)
- [x] `apps/api/src/routes/tournaments.ts` — porte dos route handlers para Fastify (strangler, ADR-007)
- [x] Rotas: `GET/POST /tournaments`, `GET/PATCH/DELETE /tournaments/:slug`, `POST /tournaments/:slug/results`
- [x] Contratos JSON idênticos (DTOs de listagem/detalhe porte de `_lib/serialize.ts`); erros via `AppError` → handler global
- [x] Typecheck + lint + build `@digimon/app-api` ok
- [x] Smoke via `app.inject` (health, 401 nas protegidas, 200 list/detalhe, 201 create, 200 patch/results/delete)
- [x] Strangler: `apps/web/src/app/api/tournaments/**` mantido (web segue funcionando)

## Handoff (task 42)
### Feito
- Porte dos handlers de torneios de `apps/web/src/app/api/tournaments/**` para rotas Fastify em
  `apps/api/src/routes/tournaments.ts`, reusando os use cases/schemas de `@digimon/tournaments`.
- Composição (DIP) no próprio handler: `PrismaTournamentRepository(prisma)` + `eventBus` do
  `../container`; serialização para DTO (`TournamentDTO` / `TournamentSummaryDTO`) idêntica à do web.
- Sessão reusando `getAuthContext` do `plugins/auth` (cookie httpOnly + fallback Bearer); leitura
  pública usa ator opcional (null em `UnauthorizedError`), `?mine=true` e mutações exigem sessão.
- Contratos validados por `app.inject`: create `201 { id, slug }`; detalhe DTO completo; patch
  `200 { id, slug }`; results `200 { id, status: 'finished' }`; delete `200 { id, status: 'cancelled' }`;
  não autenticado `401 { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }`;
  slug inexistente `404 { error: { code: 'NOT_FOUND', ... } }`.

### Arquivos
- `apps/api/src/routes/tournaments.ts` (stub → rotas)
- `context/modules/tournaments/status.md`

### Decisões
- `container.ts` não expõe `tournamentsDeps()` e está **fora do escopo** desta task; a composição dos
  use cases de torneios fica no topo do handler, reusando o `eventBus` in-process do container e o
  singleton `prisma` — sem duplicar regra de domínio.
- Erros não são traduzidos no handler: o `error-handler` global da API já devolve
  `{ error: { code, message, details } }` para `AppError`.
- Sessão via `plugins/auth` (cookie + Bearer) em vez de cookie-only — alinha com o desenho do
  scaffold e com a API pública (mobile/Bearer), sem alterar o contrato observado pelo web.

### Pendências
- Testes de integração com Postgres real permanecem fora deste porte (mesma pendência da task 13).
- `apps/web/src/app/api/tournaments/**` só sai na fase de corte do strangler (task de wiring do
  `api-client`, 44/45).

## Fase 3 — Frontend: detalhe do torneio (`/torneios/[slug]`) + resultados (task 88)
- [x] Rota `apps/web/src/app/(public)/torneios/[slug]/page.tsx` (conserta o 404; `generateMetadata` SSR + cookie)
- [x] View `TournamentDetailView`: cabeçalho, informações, classificação (tabela/lista por posição) e ações por papel (registrar/editar resultados + cancelar com confirmação; visitante sem ações destrutivas)
- [x] View `TournamentResultsForm`: linhas dinâmicas (posição/jogador/deck/record), validação local, feedback de sucesso/erro
- [x] ViewModel `useTournament`: `isNotFound` (404 sem vazar cancelado de terceiros), papel (`isOrganizer`/`isManager`/`canManage`), ações reusando `use-tournament-actions`, invalidação da query do torneio + listagem
- [x] `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings)

## Handoff (task 88)
### Feito
- Frontend do detalhe do torneio consumindo as rotas reais (`GET /tournaments/:slug`, `POST /tournaments/:slug/results`, `DELETE /tournaments/:slug`). MVVM estrito: View só JSX; fetch/mutations no ViewModel/Model; sem importar `@digimon/tournaments` no client.
- Cabeçalho (nome/status/formato/local/datas/descrição), seções de informação (`<dl>`), classificação (tabela `sm+` / lista mobile, ordenada por `position`) e estado vazio claro; 404 "Torneio não encontrado" sem vazar cancelado de terceiros; "Voltar para torneios".
- Ações por papel: organizador OU Admin/Editor registram/editam resultados e cancelam (confirmação inline); visitante não vê ações destrutivas.

### Arquivos
- `apps/web/src/app/(public)/torneios/[slug]/page.tsx` (novo)
- `apps/web/src/features/tournaments/views/tournament-detail-view.tsx` (novo)
- `apps/web/src/features/tournaments/views/tournament-results-form.tsx` (novo)
- `apps/web/src/features/tournaments/views/index.ts` (barrel)
- `apps/web/src/features/tournaments/viewmodels/use-tournament.ts` (enriquecido)

### Decisões
- Cancelar só quando `status === 'published'`; registrar/editar resultados quando `status !== 'cancelled'` (espelha as transições da entidade `Tournament`).
- Organizador exibido só quando o visitante é o dono (não há `GET /users/:id` público).
- Invalidação da query `['tournament', slug]` feita no `use-tournament.ts` (o `use-tournament-actions.ts` está fora do escopo e continua invalidando a listagem `['tournaments']`).
- Form de resultados recebe submit/mutation por props do ViewModel; sucesso controlado localmente no VM.

### Pendências
- "Editar dados do torneio" não implementado (rota de UI inexistente; `PATCH /tournaments/:slug` já existe) — task própria.
- Testes de integração com Postgres real seguem pendentes (mesma pendência das tasks 42/13).