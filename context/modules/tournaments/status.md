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