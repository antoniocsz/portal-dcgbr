# Task: api — revogação imediata do access token na exclusão da conta
## Agente: `agente-backend`
## Módulo: `apps/api`
## Escopo (arquivos que esta task vai tocar):
- `apps/api/src/session-revocation.ts` (novo)
- `apps/api/src/plugins/auth.ts`
- `apps/api/src/routes/users.ts`
## Depende de: [ ] `110-lgpd-direitos-titular.md`
## Contexto para ler: context/modules/users/context.md, ADR-002*, ADR-005, apps/api/src/plugins/auth.ts
## Skills a carregar: codegen.md + backend.md + security.md
## Pendência (revisão do Lote 16):
Ao excluir a conta (`DELETE /users/me`), os **refresh tokens** são revogados e os cookies limpos, mas o **access token (JWT stateless)** continua válido até expirar. Revogar imediatamente.
## O que fazer:
1. **`apps/api/src/session-revocation.ts`** (novo): registry **em memória** (process-local, ADR-005) de sessões revogadas por `userId`:
   - `revokeSession(userId: string): void` (guarda `userId → expiraEm`, TTL = duração do access token, ex.: 1h, com expurgo preguiçoso),
   - `isSessionRevoked(userId: string): boolean`.
   - Documentar a limitação (some em restart; single-process).
2. **`plugins/auth.ts`**: em `getAuthContext`, após `verifyJwt`, rejeitar com `UnauthorizedError` quando `isSessionRevoked(context.userId)`. Isso cobre todas as rotas autenticadas (`authenticate`/`requireRoleHook`).
3. **`routes/users.ts`**: no `DELETE /users/me`, após o sucesso do use case, chamar `revokeSession(userId)` (antes de limpar cookies).
4. Não alterar o payload do JWT nem o schema (nada de `tokenVersion`).
## Especificação:
- Sem dependências novas; sem DB.
- Não quebrar login/logout normais (usuário não revogado passa).
## Critério de conclusão:
- [ ] Após `DELETE /users/me`, uma requisição autenticada com o **mesmo access token** → 401
- [ ] Usuários normais não são afetados
- [ ] `pnpm turbo typecheck lint build --filter=@digimon/app-api` passando
- [ ] Smoke `app.inject`: token válido → 200; delete → 204; mesmo token → 401
## Ao terminar: atualizar `context/modules/users/status.md`, rodar `pnpm harness finish 113` e registrar o handoff
## Complexidade: média

## Baseline (git)
- apps/web/src/components/consent-banner.tsx
- apps/web/src/features/users/model/types.ts
- context/modules/web/status.md
- context/agents/done/111-web-users-tipos-locais.md
- context/agents/done/112-web-consent-banner-fora-admin.md
- context/agents/queue/113-api-revogacao-access-token.md
- context/agents/queue/114-backend-module-privacy.md
- context/agents/queue/115-web-privacy-consent-requests.md
- context/modules/privacy/context.md
- context/modules/privacy/status.md
