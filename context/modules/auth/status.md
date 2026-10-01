# @digimon/auth — Status

## Fase 1 — Fundação (task 02-module-auth-users)
- [x] Entidades: `RefreshToken` (rotation/revogação) e `PasswordResetToken` (single-use, TTL 15min) — domínio puro, factory + getters
- [x] Repository interfaces (DIP): `RefreshTokenRepository`, `PasswordResetTokenRepository`, `UserAccountRepository` (porta de saída — implementada pelo @digimon/users via adapter no composition root)
- [x] Use cases: `RegisterUseCase` (papel padrão member, senha forte Zod, evento user.created), `LoginUseCase` (mensagem genérica + timing attack), `RefreshTokenUseCase` (rotation — token antigo rejeitado), `LogoutUseCase` (revoga refresh, idempotente), `ForgotPasswordUseCase` (token 15min, resposta genérica), `ResetPasswordUseCase` (single-use, revoga refresh tokens, evento password.reset)
- [x] Services: `IPasswordHasher` → `ScryptPasswordHasher` (scrypt nativo node:crypto, sem dep externa); `ITokenService` → `JwtTokenService` (JWT HS256 próprio, access 15min; refresh aleatório com hash SHA-256 persistido)
- [x] Middleware `verify-jwt` + `requireRole` (RBAC papéis globais — ADR-004) + `InMemoryRateLimiter` (register 5 req/15min — ADR-005)
- [x] Schemas Zod em `use-cases/schemas.ts` (mesma fonte de verdade dos route handlers) + `parseOrThrow` (ZodError → ValidationError)
- [x] Implementações Prisma: `PrismaRefreshTokenRepository`, `PrismaPasswordResetTokenRepository`
- [x] Eventos: `user.created`, `password.reset.requested`, `password.reset` via EventBus
- [x] Testes unitários: 22 passando (rotation, reset expirado/reutilizado, senha fraca, login, verify-jwt, rate limit)
- [x] Barrel export público (`src/index.ts`)

## Fase 2 — Refinamentos
- [x] Typecheck: `pnpm turbo typecheck` — 7/7 pacotes
- [x] Lint: `pnpm turbo lint` — 7/7 pacotes
- [x] UI/frontend MVVM (features/auth): RegisterView, LoginView, ForgotPasswordView, ResetPasswordView + ViewModels + auth-api (Model)
- [ ] Integração de eventos com handlers reais (publicadores prontos; assinantes em tasks futuras)
- [ ] Testes de integração (banco real) — pendente, task futura

## Handoff
- **Feito:** módulo `@digimon/auth` completo (domínio + use cases + infra Prisma + JWT próprio + middleware + rate limit). Route handlers `/api/auth/*` (register com rate limit 5/15min, login, refresh com rotation via cookie, logout, forgot-password, reset-password). Features MVVM de auth. 22 testes unitários.
- **Pendências:** JWT_SECRET precisa de valor real em produção (≥32 chars) — ver `.env`/deploy; reset token em produção deve ser entregue por email (hoje o ForgotPassword só persiste e publica evento — sem provedor de email na v1); `ScryptPasswordHasher` usa scrypt nativo em vez de bcrypt/argon2 (decisão: zero dependências novas, guard rail pnpm install).
- **Decisões:** senha com scrypt nativo do node:crypto (NIST) em vez de bcrypt/argon2 — mesma classe de segurança, sem dependência nativa; JWT HS256 implementado à mão com node:crypto (ADR-002 "auth própria"); refresh token armazenado apenas como hash SHA-256 (nunca em claro); rate limit in-memory (ADR-005 sem Redis, ok em contêiner único Coolify); DIP entre módulos via porta `UserAccountRepository` + adapter no composition root (módulos nunca se importam diretamente); `crypto.randomUUID()` no use case para id de tokens (o Prisma aceita id explícito em @default(cuid())).
## Fase 7 — Indicador de sessão público (task 23)
- [x] `/api/auth/me` reutiliza verifyJwt + GetProfileUseCase (sem novo use case)
- [x] Logout no header usa POST /api/auth/logout existente (revoga refresh + limpa cookies)
- [x] Sem mudança no módulo @digimon/auth (só composição no apps/web)

## Handoff (task 23)
- **Feito:** header mostra avatar dropdown quando logado; logout funcional via rota existente.
- **Decisões:** leitura de sessão 100% client-side (fetch /me) para não quebrar geração estática das páginas públicas.
