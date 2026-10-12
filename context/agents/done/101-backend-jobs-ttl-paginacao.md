# Task: backend — jobs de importação: expurgo (TTL/limite) + listagem paginada
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/jobs/import-job-registry.ts`
- `apps/api/src/jobs/index.ts`
- `apps/api/src/routes/cards.ts`
## Depende de: [ ] `98-backend-import-assincrono.md`
## Contexto para ler: context/modules/cards/status.md, ADR-005
## Skills a carregar: codegen.md + backend.md
## Pendências (apontadas na revisão do Lote 13):
1. O `ImportJobRegistry` (Map) **nunca remove entradas** → cresce indefinidamente em processos longevos.
2. `GET /cards/admin/import-source/jobs` devolve **todos** os snapshots (com `result`/`error` completos), sem paginação/limite.
## O que fazer:
1. **Expurgo no registry**:
   - Limitar o número de jobs mantidos (ex.: **manter os N=20 mais recentes**) e/ou **TTL** (descartar jobs **finalizados** mais antigos que X, ex.: 1h). Nunca descartar um job `running`.
   - Rodar o expurgo de forma barata no `start()` (e/ou no `list()`/`get()`), sem varrer a lista em toda leitura de forma custosa.
   - Manter `get(id)`/`start()` funcionando (job recém-criado sempre disponível).
2. **Listagem paginada/limitada** na rota `GET /cards/admin/import-source/jobs`:
   - Ordenar por `startedAt` **decrescente** (mais recentes primeiro).
   - Aceitar `?limit=` (default 20, máximo ex.: 100) e, se simples, `?offset=`. Retornar `{ jobs, total }` (ou `{ jobs }` + `limit`).
   - Documentar o contrato no comentário da rota.
3. Não alterar o `POST .../jobs` (202) nem o `GET .../jobs/:jobId` (contrato atual), nem o use case de importação.
## Especificação:
- Process-local (ADR-005) — a limitação de volatilidade em restart permanece documentada.
- Sem `package.json`/dependências novas.
## Critério de conclusão:
- [ ] Registry expurga (N mais recentes e/ou TTL de finalizados), nunca remove `running`
- [ ] `GET .../jobs` limitado (default 20) e ordenado desc
- [ ] `pnpm turbo typecheck lint test build --filter=@digimon/app-api` passando
- [ ] Smoke `app.inject`/servidor: 202 → polling → listagem limitada (ou reportar bloqueio)
## Ao terminar: atualizar `context/modules/cards/status.md`, rodar `pnpm harness finish 101` e registrar o handoff
## Complexidade: média

## Baseline (git)
- context/agents/active/100-web-home-cta-logado.md
- context/agents/queue/101-backend-jobs-ttl-paginacao.md
