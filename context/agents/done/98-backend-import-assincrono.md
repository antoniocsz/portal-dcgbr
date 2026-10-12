# Task: importação externa assíncrona (job + progresso) — API + admin
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/routes/cards.ts`
- `apps/api/src/container.ts`
- `apps/api/src/jobs/**` (novo)
- `apps/web/src/features/cards/model/cards-api.ts`
- `apps/web/src/features/cards/model/types.ts`
- `apps/web/src/features/cards/viewmodels/use-admin-cards.ts`
- `apps/web/src/features/cards/views/admin-cards-view.tsx`
## Depende de: [ ] `68-backend-cards-import-taka.md`, `70-backend-cards-sets-populate.md`
## Contexto para ler: context/modules/cards/context.md, context/modules/cards/status.md, ADR-005 (sem Redis), ADR-007
## Skills a carregar: codegen.md + backend.md + frontend.md
## Pendência (ops):
A importação externa (`POST /cards/admin/import-source`) é **síncrona** (~39s, 8,7 MB + 4.480 upserts). Atrás de proxy (Coolify/nginx) pode estourar o timeout da requisição.
## O que fazer (backend):
1. **Registry de jobs em memória** (`apps/api/src/jobs/**`): um `ImportJobRegistry` (Map) com `{ id, status: 'running'|'done'|'error', startedAt, finishedAt, result?, error? }`. Process-local (sem Redis — ADR-005); documentar a limitação (some em restart).
2. **Rotas novas** (administrator), mantendo a rota síncrona atual para compatibilidade:
   - `POST /cards/admin/import-source/jobs` — body opcional `{ source?, sets?, ids?, max? }`; **dispara o job em background** (fire-and-forget, sem `await` no handler) e responde **`202 { jobId }`** imediatamente.
   - `GET /cards/admin/import-source/jobs/:jobId` — `{ status, startedAt, finishedAt, result?, error? }` (404 se jobId desconhecido).
   - (Opcional) `GET /cards/admin/import-source/jobs` — lista os jobs recentes.
3. **Composição** no `container.ts`: instanciar o registry + injetar no use case/handler. Reusar `ImportCardsFromSourceUseCase` (não duplicar regra).
4. Capturar erro do job no registry (não derrubar o processo).
## O que fazer (frontend admin):
5. **`cards-api.ts`/`types.ts`**: `startSourceImport()` (POST jobs → `{ jobId }`) e `getSourceImportJob(jobId)`.
6. **`use-admin-cards.ts`**: iniciar o job e **fazer polling** (ex.: a cada 2s até `done`/`error`), expondo progresso/estado; parar no unmount.
7. **`admin-cards-view.tsx`**: o botão "Importar catálogo externo" passa a iniciar o job e mostrar **progresso** ("Importando…") até concluir (mostrar `imported/updated/skipped/setsCount`); erro tratado. Manter o import por JSON.
## Especificação:
- Erros do job não vazam detalhes sensíveis; 401/403 como nas demais rotas admin.
- MVVM estrito no web (polling no ViewModel).
## Critério de conclusão:
- [ ] `POST .../jobs` responde 202 imediatamente; `GET .../jobs/:id` reporta progresso/resultado
- [ ] Admin UI inicia o job e mostra progresso/resultado (sem travar a requisição)
- [ ] `pnpm turbo typecheck lint test build --filter=@digimon/app-api --filter=@digimon/app-web` passando (o build do web pode ser rodado; se preferir, `typecheck lint`)
- [ ] Smoke `app.inject`: 202 + polling até done (ou reportar bloqueio)
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 98` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/web/src/app/(member)/torneios/novo/page.tsx
- apps/web/src/features/decks/viewmodels/use-deck-image-export.ts
- context/modules/cards/status.md
- context/modules/decks/status.md
- context/modules/web/status.md
- apps/web/src/app/not-found.tsx
- context/agents/done/94-web-torneios-novo-layout.md
- context/agents/done/95-web-not-found-brandado.md
- context/agents/done/96-web-download-png-anchor.md
- context/agents/done/97-backend-testes-integracao-postgres.md
- context/agents/queue/98-backend-import-assincrono.md
- packages/modules/cards/src/test/cards.integration.spec.ts
- packages/modules/cards/src/test/integration-db.ts
- packages/modules/decks/src/test/decks.integration.spec.ts
- packages/modules/decks/src/test/integration-db.ts
