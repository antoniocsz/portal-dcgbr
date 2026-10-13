# @digimon/privacy — Status

## Fase 1 — Fundação (task 114+)
- [x] Pacote `@digimon/privacy` (domain + use-cases + infra + barrel)
- [x] Entidades `ConsentRecord` + `DataRequest`
- [x] Interfaces de repositório (DIP)
- [x] Use cases: RecordConsent, ListConsentRecords, CreateDataRequest, ListDataRequests, UpdateDataRequestStatus
- [x] Implementação Prisma
- [x] Schema Prisma + migration (`consent_records`, `data_requests` + enums)
- [x] Eventos (`consent.recorded`, `privacy.request.created`, `privacy.request.updated`)
- [x] Testes unitários (20 testes — entidades + use cases com repos em memória)
- [x] Rotas API (público + admin) + composição no container
- [x] Frontend: banner registra consentimento server-side; form de solicitação; fila no admin (task 115)

## Rotas entregues (apps/api)
- `POST /consent` — público, best-effort → sempre `204` (nunca bloqueia o cliente).
- `POST /privacy/requests` — público → `201 { id }`.
- `GET /admin/privacy/requests` — administrator|editor; filtro `?status=`; `{ items, total, page, pageSize }`.
- `PATCH /admin/privacy/requests/:id` — administrator|editor; `{ status }` → `200`.
- `GET /admin/consent` — administrator; `{ items, total, page, pageSize }`.

## Schema
- `consent_records` — `subjectKey` (opaco), `userId?` (FK SetNull), `analytics`, `ads`, `policyVersion`, `userAgent?` (truncado), `createdAt`; índices por `subjectKey`/`userId`/`createdAt`.
- `data_requests` — `type` (`DataRequestType`), `name`, `email`, `message`, `userId?` (FK SetNull), `status` (`DataRequestStatus` default `OPEN`), timestamps; índices `[status, createdAt]`/`email`/`userId`.
- Migration: `20261012130000_privacy`.

## Handoff
- **Feito**: pacote `@digimon/privacy` (domain + schemas Zod + 5 use cases + repos Prisma + repos em memória + 20 testes); enums/models `ConsentRecord`/`DataRequest` no schema + migration aplicada no Postgres local; barrel `@digimon/database` atualizado; rotas em `apps/api/src/routes/privacy.ts` registradas e `privacyDeps()` no container; dependência `@digimon/privacy` declarada em `apps/api`.
- **Decisões**: `POST /consent` é best-effort (erros logados, resposta sempre 204); `policyVersion` default `2026-01` (`DEFAULT_POLICY_VERSION`); `userAgent` truncado em 300 chars; `subjectKey`/`userId?` sem PII sensível; fila acessível a administrator|editor, auditoria de consentimento só administrator; `userId` é FK opcional `onDelete: SetNull`.
- **Verificação**: `pnpm turbo typecheck lint test --filter=@digimon/privacy --filter=@digimon/database --filter=@digimon/app-api` ✓ (20 testes); `pnpm turbo build --filter=@digimon/app-api` ✓; smoke `app.inject` ✓ (`/consent` 204, `/privacy/requests` 201, fila 401/403/200, `PATCH` 200, `/admin/consent` 401/403/200).
- **Pendências**: frontend (task 115) — banner registra consentimento server-side, form `/privacidade/solicitacao`, fila `/admin/solicitacoes`. `pnpm install` foi necessário para linkar o novo pacote do workspace (`apps/api/package.json` + `pnpm-lock.yaml`).

## Handoff (task 115 — frontend)
- **Feito:** frontend LGPD entregue em `apps/web` (MVVM estrito), consumindo as rotas reais de `apps/api/src/routes/privacy.ts`:
  - **Consentimento server-side:** `features/consent/model/consent.ts` gera/guarda um `subjectKey` opaco (`getSubjectKey()`) e expõe `recordConsentOnServer(state)`; `features/consent/viewmodels/use-consent.ts` chama o registro (`POST /consent` com `{ subjectKey, analytics, ads, policyVersion }`) de forma **best-effort** após cada decisão (aceitar/rejeitar/salvar), sem bloquear nem quebrar a UI. `CONSENT_POLICY_VERSION = '2026-01'`.
  - **Form de solicitação:** nova feature `features/privacy/**` (Model `privacy-api`/`types` literais, ViewModel `useDataRequest`, View `DataRequestFormView`) + página pública `/privacidade/solicitacao` (`POST /privacy/requests`) e link "Como exercer seus direitos" na Política de Privacidade.
  - **Fila no admin:** `features/admin/model/privacy-admin-api.ts` (`GET /admin/privacy/requests`, `PATCH /admin/privacy/requests/:id`), ViewModel `useAdminDataRequests`, View `AdminDataRequestsView`, página `/admin/solicitacoes` e item "Solicitações LGPD" no `AdminShell`.
- **Decisões:** `POST /consent` tratado como auditoria best-effort (nunca bloqueia); `subjectKey` sem PII; tipos literais no client (sem importar `@digimon/privacy`); fila com filtro por status e ações Em andamento/Concluído/Rejeitado; item de sidebar visível a administrator **e** editor (o backend revalida).
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/app-web` ✅ (2/2; 0 erros, 0 warnings; `next build` não executado por instrução). Detalhes completos em `context/modules/web/status.md` (Handoff task 115).
- **Pendências:** nenhuma no frontend. O conteúdo legal segue como documento-modelo sujeito a revisão jurídica; o bump de `policyVersion` deve acompanhar qualquer mudança no texto legal (front em `CONSENT_POLICY_VERSION` + backend em `DEFAULT_POLICY_VERSION`).

## Handoff (task 117 — chore docs)
- **Feito:** alinhamento de documentação/comentários (sem mudança de comportamento/schema):
  - `context/modules/privacy/context.md` — doc do `GET /admin/consent` corrigida para paginado (`{ items, total, page, pageSize }`), igual ao retorno real da rota.
  - `packages/database/prisma/schema.prisma` — newline final adicionado (schema inalterado).
  - Comentários cruzados de versionamento: `DEFAULT_POLICY_VERSION` (`packages/modules/privacy/src/domain/entities/consent-record.ts`) e `CONSENT_POLICY_VERSION` (`apps/web/src/features/consent/model/consent.ts`) agora apontam um para o outro — "bump junto com o outro" quando o texto legal mudar.
- **Decisões:** nenhuma nova — task puramente documental.
- **Validação:** `pnpm turbo typecheck lint --filter=@digimon/privacy --filter=@digimon/app-web` ✅ (4/4; 0 erros, 0 warnings).
- **Pendências:** nenhuma.
