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