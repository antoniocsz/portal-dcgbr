# Task: web — consentimento server-side + canal de solicitações LGPD (form + fila admin)
## Agente: `agente-frontend`
## Módulo: `apps/web`
## Escopo (arquivos que esta task vai tocar):
- `apps/web/src/features/consent/model/consent.ts`
- `apps/web/src/features/consent/viewmodels/use-consent.ts`
- `apps/web/src/features/privacy/**` (novo)
- `apps/web/src/app/(public)/privacidade/solicitacao/page.tsx` (novo)
- `apps/web/src/features/legal/model/content.ts`
- `apps/web/src/features/admin/model/privacy-admin-api.ts` (novo)
- `apps/web/src/features/admin/viewmodels/use-admin-data-requests.ts` (novo)
- `apps/web/src/features/admin/views/admin-data-requests-view.tsx` (novo)
- `apps/web/src/features/admin/views/admin-shell.tsx`
- `apps/web/src/features/admin/index.ts`
- `apps/web/src/app/admin/solicitacoes/page.tsx` (novo)
## Depende de: [ ] `114-backend-module-privacy.md`
## Contexto para ler: context/modules/privacy/context.md, context/modules/web/context.md, context/project/design
## Skills a carregar: codegen.md + frontend.md + ui-ux.md
## O que criar (MVVM estrito):
1. **Consentimento server-side** (`features/consent`):
   - `model/consent.ts`: gerar/guardar um **`subjectKey`** opaco no `localStorage` (ex.: `crypto.randomUUID()`); expor `getSubjectKey()`.
   - `viewmodels/use-consent.ts`: ao decidir (aceitar/rejeitar/salvar), **registrar no servidor** via `POST /consent` (`{ subjectKey, analytics, ads, policyVersion }`) de forma **best-effort** (não bloqueia nem quebra se falhar); manter o comportamento local atual.
   - `policyVersion`: constante (ex.: `'2026-01'`) — documentar bump quando o texto legal mudar.
2. **Canal de solicitações** (`features/privacy/**`):
   - Model (`types.ts`, `privacy-api.ts`): `createDataRequest({ type, name, email, message })` → `POST /privacy/requests`.
   - ViewModel `use-data-request.ts`: form + validação + submit + estados.
   - View `data-request-form.tsx`: campos **tipo** (acesso/correção/eliminação/portabilidade/revogação/outro), nome, e-mail, mensagem; confirmação/erro.
   - Página **`/privacidade/solicitacao`** (Server Component + metadata; renderiza o form).
3. **Link** no conteúdo legal: em `features/legal/model/content.ts`, adicionar no documento de Privacidade a referência "**Como exercer seus direitos** → `/privacidade/solicitacao`" (bloco de link).
4. **Fila no admin**:
   - `admin/model/privacy-admin-api.ts`: `listDataRequests({status})`, `updateStatus(id, status)`.
   - `admin/viewmodels/use-admin-data-requests.ts`: fila (filtro por status) + atualizar status.
   - `admin/views/admin-data-requests-view.tsx` (só JSX): tabela (tipo, nome, e-mail, mensagem, status, data) + filtro + ações de status (Em andamento/Concluído/Rejeitado).
   - Página **`/admin/solicitacoes`** (administrator|editor) + item **"Solicitações LGPD"** na sidebar do `AdminShell` (gated).
   - Barrel `features/admin/index.ts`.
## Especificação:
- Não importar `@digimon/privacy` no client; tipos literais.
- Acesso à fila: administrator|editor (backend revalida).
## Critério de conclusão:
- [ ] Decisão de consentimento é registrada em `POST /consent` (best-effort) com `subjectKey`
- [ ] `/privacidade/solicitacao` envia a solicitação; link na política
- [ ] `/admin/solicitacoes` lista e atualiza status; item na sidebar
- [ ] `pnpm turbo typecheck lint --filter=@digimon/app-web` passando (não rodar `next build`)
## Ao terminar: atualizar `context/modules/web/status.md` e `context/modules/privacy/status.md`, rodar `pnpm harness finish 115` e registrar o handoff
## Complexidade: alta

## Baseline (git)
- apps/api/package.json
- apps/api/src/container.ts
- apps/api/src/plugins/auth.ts
- apps/api/src/routes/index.ts
- apps/api/src/routes/users.ts
- apps/web/src/components/consent-banner.tsx
- apps/web/src/features/users/model/types.ts
- context/modules/users/status.md
- context/modules/web/status.md
- packages/database/prisma/schema.prisma
- packages/database/src/generated/prisma/browser.ts
- packages/database/src/generated/prisma/client.ts
- packages/database/src/generated/prisma/commonInputTypes.ts
- packages/database/src/generated/prisma/enums.ts
- packages/database/src/generated/prisma/internal/class.ts
- packages/database/src/generated/prisma/internal/prismaNamespace.ts
- packages/database/src/generated/prisma/internal/prismaNamespaceBrowser.ts
- packages/database/src/generated/prisma/models.ts
- packages/database/src/generated/prisma/models/User.ts
- packages/database/src/index.ts
- pnpm-lock.yaml
- apps/api/src/routes/privacy.ts
- apps/api/src/session-revocation.ts
- context/agents/done/111-web-users-tipos-locais.md
- context/agents/done/112-web-consent-banner-fora-admin.md
- context/agents/done/113-api-revogacao-access-token.md
- context/agents/done/114-backend-module-privacy.md
- context/agents/queue/115-web-privacy-consent-requests.md
- context/modules/privacy/context.md
- context/modules/privacy/status.md
- packages/database/prisma/migrations/20261012130000_privacy/migration.sql
- packages/database/src/generated/prisma/models/ConsentRecord.ts
- packages/database/src/generated/prisma/models/DataRequest.ts
- packages/modules/privacy/package.json
- packages/modules/privacy/src/domain/actor.ts
- packages/modules/privacy/src/domain/entities/consent-record.spec.ts
- packages/modules/privacy/src/domain/entities/consent-record.ts
- packages/modules/privacy/src/domain/entities/data-request.spec.ts
- packages/modules/privacy/src/domain/entities/data-request.ts
- packages/modules/privacy/src/domain/events/privacy-events.ts
- packages/modules/privacy/src/domain/repositories/consent-record-repository.ts
- packages/modules/privacy/src/domain/repositories/data-request-repository.ts
- packages/modules/privacy/src/index.ts
- packages/modules/privacy/src/infra/repositories/prisma-consent-record-repository.ts
- packages/modules/privacy/src/infra/repositories/prisma-data-request-repository.ts
- packages/modules/privacy/src/test/memory-repositories.ts
- packages/modules/privacy/src/use-cases/create-data-request.ts
- packages/modules/privacy/src/use-cases/list-consent-records.ts
- packages/modules/privacy/src/use-cases/list-data-requests.ts
- packages/modules/privacy/src/use-cases/privacy.spec.ts
- packages/modules/privacy/src/use-cases/record-consent.ts
- packages/modules/privacy/src/use-cases/schemas.ts
- packages/modules/privacy/src/use-cases/update-data-request-status.ts
- packages/modules/privacy/tsconfig.json
- packages/modules/privacy/vitest.config.ts
