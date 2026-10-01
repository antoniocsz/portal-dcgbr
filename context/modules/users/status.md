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

## Handoff
- **Feito:** módulo `@digimon/users` completo (entidade + use cases + repositório Prisma). Route handlers `/api/users/*` protegidos por verify-jwt: GET/PATCH `/me` (próprio perfil), GET `/` (listagem admin), PATCH `/[id]/role` (admin), PATCH `/[id]/status` (admin). Features MVVM de users. 3 testes unitários.
- **Pendências:** seed de um usuário administrator inicial (não existe ainda — ver task de bootstrap/CLI); `UserRepository.update` grava passwordHash/emailVerifiedAt também (superset de updateProfile — aceitável, mantém consistência).
- **Decisões:** papéis fixos e globais validados no use case (nunca confiar só na UI); `ActivateUserUseCase`/`DeactivateUserUseCase` separados conforme spec da task; desativar a própria conta admin ativa é bloqueado (proteção contra lockout); `User` expõe getters e `data` (mesmo padrão do módulo content); adapter `UserAccountAdapter` no composition root faz a ponte com a porta do auth (fronteiras respeitadas).