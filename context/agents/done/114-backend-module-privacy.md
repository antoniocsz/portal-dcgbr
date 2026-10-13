# Task: módulo @digimon/privacy (registro de consentimento + solicitações LGPD) + schema + rotas
## Agente: `agente-backend`
## Módulo: `packages/modules/privacy`
## Escopo (arquivos que esta task vai tocar):
- `packages/modules/privacy/**`
- `packages/database/prisma/**`
- `packages/database/src/**`
- `apps/api/src/routes/privacy.ts` (novo)
- `apps/api/src/routes/index.ts`
- `apps/api/src/container.ts`
- `context/modules/privacy/**`
## Depende de: [ ] `108-web-paginas-legais-lgpd.md`, `110-lgpd-direitos-titular.md`
## Contexto para ler: context/modules/privacy/context.md, context/modules/privacy/status.md, context/modules/ads/context.md (padrão de módulo)
## Skills a carregar: codegen.md + backend.md + data.md
## Objetivo:
Persistir **consentimento** (auditoria) e abrir o **canal de solicitações do titular** (LGPD art. 18 §3º).
## O que criar:
1. **Domínio** (`packages/modules/privacy/src/domain`):
   - `entities/consent-record.ts` — `ConsentRecord` (subjectKey opaco, userId?, analytics, ads, policyVersion, userAgent?, createdAt).
   - `entities/data-request.ts` — `DataRequest` + `DataRequestType` (`access|correction|deletion|portability|consent_revocation|other`) + `DataRequestStatus` (`open|in_progress|done|rejected`); invariante: `email` válido, `message` não vazio.
   - `repositories/` — `ConsentRecordRepository`, `DataRequestRepository` (DIP).
   - `events/privacy-events.ts` — `consent.recorded`, `privacy.request.created`, `privacy.request.updated`.
   - `actor.ts` — administrator/editor para a fila.
2. **Use cases** + `schemas.ts` Zod: `RecordConsentUseCase`, `ListConsentRecordsUseCase`, `CreateDataRequestUseCase`, `ListDataRequestsUseCase` (filtro status), `UpdateDataRequestStatusUseCase`.
3. **Infra**: `PrismaConsentRecordRepository`, `PrismaDataRequestRepository`.
4. **Barrel** público.
5. **Schema Prisma**: `model ConsentRecord` (`@@map("consent_records")`) + `model DataRequest` (`@@map("data_requests")`, enums `DataRequestType`/`DataRequestStatus`, índices) + migration `<ts>_privacy`. Regenerar client; atualizar barrel do `@digimon/database`.
6. **Rotas** (`apps/api/src/routes/privacy.ts`, registradas em `routes/index.ts`; composição `privacyDeps()` no container):
   - `POST /consent` — público (`{ subjectKey, analytics, ads, policyVersion? }`) → 204 (best-effort).
   - `POST /privacy/requests` — público (`{ type, name, email, message }`) → 201 `{ id }`.
   - `GET /admin/privacy/requests` — administrator|editor (filtro `status`) → `{ items, total, page, pageSize }`.
   - `PATCH /admin/privacy/requests/:id` — administrator|editor (`{ status }`) → 200.
   - `GET /admin/consent` — administrator → lista/resumo (`{ items, total }`).
7. **Testes** unitários com repos em memória: consent registra; data request cria/valida; list filtra por status; update status; autorização da fila.
8. **Docs**: `context/modules/privacy/status.md`.
## Especificação:
- `subjectKey`/`userAgent` sem PII sensível (userAgent truncado); ids `cuid()`.
- Não tocar no frontend (task 115).
## Critério de conclusão:
- [ ] Módulo + schema/migration + rotas + container; testes passando
- [ ] `pnpm turbo typecheck lint test --filter=@digimon/privacy --filter=@digimon/database --filter=@digimon/app-api` passando
- [ ] Smoke `app.inject`: `POST /consent` 204; `POST /privacy/requests` 201; admin fila 401/403/200; PATCH 200
## Ao terminar: atualizar `context/modules/privacy/status.md`, rodar `pnpm harness finish 114` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/src/plugins/auth.ts
- apps/api/src/routes/users.ts
- apps/web/src/components/consent-banner.tsx
- apps/web/src/features/users/model/types.ts
- context/modules/users/status.md
- context/modules/web/status.md
- apps/api/src/session-revocation.ts
- context/agents/done/111-web-users-tipos-locais.md
- context/agents/done/112-web-consent-banner-fora-admin.md
- context/agents/done/113-api-revogacao-access-token.md
- context/agents/queue/114-backend-module-privacy.md
- context/agents/queue/115-web-privacy-consent-requests.md
- context/modules/privacy/context.md
- context/modules/privacy/status.md
