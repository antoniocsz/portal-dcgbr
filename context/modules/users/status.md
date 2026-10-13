# @digimon/users — Status

## Fase 1 — Fundação (task 02-module-auth-users)
- [x] Entidade `User` (id, email, name, avatarUrl, passwordHash, role, emailVerifiedAt, status) — papéis fixos globais (ADR-004), invariantes: não desativa a própria conta admin ativa
- [x] Repository interface (DIP): `UserRepository` (findById, findByEmail, create, update, updatePassword, list com filtros search/role/status/paginação)
- [x] Use cases: `GetProfileUseCase`, `UpdateProfileUseCase` (nome/avatar, evento user.updated), `AssignRoleUseCase` (somente administrator, evento role.assigned), `ListUsersUseCase` (admin, filtros + PaginatedResult), `ActivateUserUseCase` / `DeactivateUserUseCase` (admin, proteção contra lockout)
- [x] Schemas Zod em `use-cases/schemas.ts` + `parseOrThrow` (ZodError → ValidationError)
- [x] Implementação Prisma: `PrismaUserRepository` (mapeia enums do schema ↔ tipos de domínio)
- [x] Eventos: `user.updated`, `role.assigned` via EventBus
- [x] Testes unitários: 3 passando (somente administrator atribui papel — critério de conclusão)
- [x] Barrel export público (`src/index.ts`)

## Fase 2 — Refinamentos
- [x] Typecheck: `pnpm turbo typecheck` — 7/7 pacotes
- [x] Lint: `pnpm turbo lint` — 7/7 pacotes
- [x] UI/frontend MVVM (features/users): ProfileView, AdminUsersView (busca, filtro por papel, atribuir papel, ativar/desativar) + ViewModels + users-api (Model)
- [x] UI ajustada ao design system (task 12): ProfileView (cabeçalho/métricas/abas/decks) e AdminUsersView (AdminTable responsiva + badges de papel/status + métricas), reusando os componentes da feature `admin`
- [ ] Testes de integração (banco real) — pendente, task futura

## Fase 3 — Rotas na API (task 37-backend-users-routes)
- [x] `apps/api/src/routes/users.ts` — porte dos handlers de `apps/web/src/app/api/users/**` (strangler, ADR-007), contratos JSON/erros idênticos
- [x] `GET /users` (admin, filtros + paginação), `GET /users/me`, `PATCH /users/me`, `PATCH /users/:id/role`, `PATCH /users/:id/status`
- [x] Reuso de `@digimon/users` + `usersDeps()` (container) + hooks `authenticate`/`requireRoleHook`
- [x] Typecheck + lint + build `@digimon/app-api` ok
- [x] Smoke via `app.inject` — 17/17 (401/403/404/409/422 + caminhos de sucesso)
- [x] Strangler: `apps/web/src/app/api/users/**` mantido (web segue funcionando)

## Handoff
- **Feito:** módulo `@digimon/users` completo (entidade + use cases + repositório Prisma). Route handlers `/api/users/*` protegidos por verify-jwt: GET/PATCH `/me` (próprio perfil), GET `/` (listagem admin), PATCH `/[id]/role` (admin), PATCH `/[id]/status` (admin). Features MVVM de users. 3 testes unitários.
- **Pendências:** seed de um usuário administrator inicial (não existe ainda — ver task de bootstrap/CLI); `UserRepository.update` grava passwordHash/emailVerifiedAt também (superset de updateProfile — aceitável, mantém consistência).
- **Decisões:** papéis fixos e globais validados no use case (nunca confiar só na UI); `ActivateUserUseCase`/`DeactivateUserUseCase` separados conforme spec da task; desativar a própria conta admin ativa é bloqueado (proteção contra lockout); `User` expõe getters e `data` (mesmo padrão do módulo content); adapter `UserAccountAdapter` no composition root faz a ponte com a porta do auth (fronteiras respeitadas).

## Handoff (task 37)
- **Feito:** rotas de usuários portadas para `apps/api/src/routes/users.ts` (Fastify), reusando `@digimon/users` via `usersDeps()` e os hooks `authenticate`/`requireRoleHook`. 5 métodos com contratos JSON/erros idênticos ao web: `GET /users` (admin), `GET /users/me`, `PATCH /users/me`, `PATCH /users/:id/role` (admin), `PATCH /users/:id/status` (admin). Autorização em duas camadas: hook RBAC (`requireRoleHook('administrator')` → 403) + revalidação no use case; sem auth → 401. Erros via `AppError` no handler global (ex.: status inválido → 422 `VALIDATION_ERROR`; auto-desativação de admin → 409 `CONFLICT`).
- **Arquivos:** `apps/api/src/routes/users.ts`, `context/modules/users/status.md`.
- **Validações:** typecheck + lint + build `@digimon/app-api` ok; smoke `app.inject` 17/17 (401/403/404/409/422 + sucessos de perfil/listagem/papel/status).
- **Decisões:** (1) `PATCH /users/me` incluído além das 4 rotas citadas no enunciado — o diretório `apps/web/src/app/api/users/me/route.ts` expõe GET **e** PATCH (`UpdateProfileUseCase`) e o requisito "contratos idênticos" exige paridade; é o mesmo arquivo do escopo. (2) `request.auth` garantido por `authenticate`, com fallback `getAuthContext` (mesmo padrão do `requireRoleHook`). (3) Status inválido replicado manualmente (mensagem/código exatos do web) em vez de `setUserStatusSchema`, para manter o contrato idêntico.
- **Fora do escopo (reportar):** `apps/web/**` intocado (strangler); nenhum outro arquivo do `apps/api` alterado.
- **Pendências:** nenhuma nesta task; wiring do frontend para a API é a task 45.

## Fase 4 — Direitos do titular: exportar dados + excluir conta (task 110)
- [x] Portas (DIP) em `@digimon/users`: `UserActivityProvider` (reúne atividade do titular — comentários/decks/torneios/publicações na comunidade — sem dependência entre módulos) e `SessionTokenRevoker` (revogação de sessões)
- [x] `ExportUserDataUseCase` — monta o JSON de portabilidade (perfil + atividade do titular; sem dados de terceiros)
- [x] `DeleteUserAccountUseCase` — eliminação por **anonimização + desativação** (`User.anonymize()`: e-mail → `deleted+<id>@invalid.local`, nome → "Usuário removido", avatar → null, status → INACTIVE), **revoga** os refresh tokens, publica `user.updated`; regra defensiva: o **único administrador ativo** não pode se excluir (409)
- [x] `User.anonymize()` na entidade (invariante de anonimização) + `PrismaUserRepository.update` passa a persistir `email` (necessário p/ anonimizar; nenhum outro fluxo altera e-mail)
- [x] Barrel `index.ts` atualizado (portas + 2 use cases)
- [x] Testes unitários: 6 novos (export 2 + delete 4) — fakes `InMemoryUserActivityProvider`/`InMemorySessionTokenRevoker`; total do módulo 9/9
- [x] Rotas em `apps/api/src/routes/users.ts`: `GET /users/me/export` (200 JSON) e `DELETE /users/me` (204 + limpa cookies), ambas `authenticate`
- [x] Composição em `apps/api/src/container.ts`: `usersDeps()` passa a expor `refreshTokens` (Prisma) + `activity` (`PrismaUserActivityProvider`, adapter sobre Prisma); sem `new PrismaClient` na rota
- [x] `pnpm turbo typecheck lint test --filter=@digimon/users` ✅ (9/9) | `typecheck lint` `@digimon/app-api` ✅ | `build` API+web ✅
- [x] Smoke `app.inject` (12 asserções): export sem auth 401 / com auth 200 (dados do titular); delete sem auth 401 / com auth 204 + cookies expirados; login pós-delete 401; linha no banco anonimizada + INACTIVE

## Handoff (task 110)
- **Feito:** direitos do titular (LGPD art. 18) no backend. `GET /users/me/export` devolve um JSON estruturado (perfil + comentários/decks/torneios/publicações na comunidade, todos do titular — sem terceiros). `DELETE /users/me` **elimina por anonimização + desativação** (política documentada), revoga todas as sessões do titular e limpa os cookies de sessão (204). Web: seção "Privacidade e meus dados" no perfil (baixar `meus-dados.json` + excluir conta com confirmação + link `/privacidade`) — detalhes em `context/modules/web/status.md`.
- **Arquivos:** `packages/modules/users/src/domain/entities/user.ts` (`anonymize`), `domain/repositories/{user-activity-provider,session-token-revoker}.ts` (novos), `infra/repositories/prisma-user-repository.ts` (persiste email), `use-cases/{export-user-data,delete-user-account}/*` (novos + specs), `testing/fakes.ts`, `src/index.ts`; `apps/api/src/routes/users.ts`, `apps/api/src/container.ts` + `context/modules/{users,web}/status.md`.
- **Decisões:** (1) **DIP entre módulos** — `users` não importa `comments/decks/tournaments` nem `auth`: define as portas `UserActivityProvider` e `SessionTokenRevoker` e o composition root (`container.ts`) implementa `PrismaUserActivityProvider` e reusa `PrismaRefreshTokenRepository` (satisfaz `SessionTokenRevoker` estruturalmente). (2) **Política de eliminação = anonimização**, não hard-delete — preserva integridade referencial (comentários/decks/torneios ficam, sem PII); documentada no status e no texto do modal. (3) Regra de lockout reusa `UserRepository.list({ role, status, pageSize: 1 }).total` em vez de novo método especulativo. (4) Evento publicado: `user.updated` (não foi criado `user.deleted` — sem consumidores; evita evento especulativo). (5) `DELETE` limpa os cookies na própria resposta (reusa `clearSessionCookies`), então o `/auth/me` subsequente já retorna `null`. (6) `PrismaUserRepository.update` passou a gravar `email` — sem efeito nos outros fluxos (nenhum altera e-mail).
- **Validação:** typecheck/lint/test `@digimon/users` (9/9) ✅; typecheck/lint/build `@digimon/app-api` e `@digimon/app-web` ✅; smoke `app.inject` 12/12 contra Postgres de dev (script temporário removido antes do `harness finish`).
- **Pendências:** nenhuma. Não há UI de admin para ver/reaver a conta anonimizada (fora do escopo). O `emailVerifiedAt` do titular anonimizado é preservado (não é PII).

## Fase 5 — Revogação imediata do access token (task 113)
- [x] `apps/api/src/session-revocation.ts` (novo): registry **em memória** (process-local, ADR-005) de sessões revogadas por `userId` — `revokeSession(userId)` guarda `userId → expiraEm` com TTL = `ACCESS_TOKEN_TTL_MS` (15min, @digimon/auth) + expurgo preguiçoso; `isSessionRevoked(userId)` checa e expurga a entrada expirada
- [x] `plugins/auth.ts`: `getAuthContext` rejeita com `UnauthorizedError('Sessão revogada')` quando `isSessionRevoked(context.userId)` — cobre `authenticate` e `requireRoleHook`
- [x] `routes/users.ts`: `DELETE /users/me` chama `revokeSession(actorId)` após o sucesso do use case e antes de limpar os cookies
- [x] Sem dependências novas, sem DB, sem alterar payload do JWT/schema (nada de `tokenVersion`)
- [x] `pnpm turbo typecheck lint build --filter=@digimon/app-api` ✅ (3/3)
- [x] Smoke `app.inject` (7 asserções): token válido → 200; `DELETE /users/me` → 204; **mesmo access token** → 401; outro usuário (não revogado) → 200

## Handoff (task 113)
- **Feito:** revogação imediata do access token (JWT stateless, ADR-002) na exclusão da conta. `session-revocation.ts` mantém um registry em memória (process-local, ADR-005) de `userId → expiraEm` com TTL igual ao do access token; `getAuthContext` consulta o registry após `verifyJwt` e lança `UnauthorizedError` para sessões revogadas; `DELETE /users/me` marca a sessão do titular antes de limpar os cookies. Fecha a pendência do Lote 16 (access token continuava válido até expirar).
- **Arquivos:** `apps/api/src/session-revocation.ts` (novo), `apps/api/src/plugins/auth.ts`, `apps/api/src/routes/users.ts`.
- **Validação:** `pnpm turbo typecheck lint build --filter=@digimon/app-api` ✅ (0 erros/0 warnings); smoke `app.inject` 7/7 (script temporário removido antes do `harness finish`).
- **Decisões:** (1) TTL = `ACCESS_TOKEN_TTL_MS` (15min — o valor real do access token), importado de `@digimon/auth`, em vez do "ex.: 1h" exemplificado na task — evita constante duplicada/desatualizada. (2) Revogação **por usuário** (invalida todos os access tokens do titular na janela), não por `jti` — mais simples e suficiente, já que o access token dura 15min. (3) Registry em módulo com `Map` e expurgo preguiçoso (sem timers/Redis) — aderente ao ADR-005.
- **Limitações (documentadas no módulo):** o registry é process-local — some em restart da API e não é compartilhado entre réplicas. Aceitável na v1 (single-process, ADR-005); se houver múltiplas réplicas, migrar para storage compartilhado (ex.: tabela Postgres de `revoked_sessions`).
- **Pendências:** nenhuma nesta task. `apps/web/**` intocado (strangler).