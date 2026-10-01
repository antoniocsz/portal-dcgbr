# @digimon/auth — Contexto do Módulo

## Responsabilidade
Autenticação própria (JWT): registro e login de usuários, refresh com rotation, recuperação de senha e sessão. Member é gratuito — sem planos/pagamento.

## Entidades
- **Session/RefreshToken** — id, userId, tokenHash, expiresAt, revokedAt
- **PasswordResetToken** — id, userId, tokenHash, expiresAt, usedAt (single-use)

## Use Cases
- `RegisterUseCase` — cria conta (Member por padrão), valida senha forte (Zod)
- `LoginUseCase` — valida credenciais, emite access + refresh
- `RefreshTokenUseCase` — rotation (token antigo rejeitado) e revogação
- `LogoutUseCase` — revoga refresh
- `ForgotPasswordUseCase` — gera token de reset (TTL 15min, single-use)
- `ResetPasswordUseCase` — valida token, troca hash, revoga refresh tokens
- `VerifyJwtMiddleware` — valida access token e injeta `userId` + `role` no request

## Eventos que Publica
- `user.created`, `user.updated`, `password.reset.requested`, `password.reset`

## Eventos que Consome
- Nenhum (módulo base)

## Dependências
- `@digimon/contracts` (tipos, erros, eventos, EventBus)
- JWT próprio (access curto + refresh com rotation) — ver ADR
- `IPasswordHasher` (bcrypt/argon2)

## Repositórios
- `IRefreshTokenRepository`
- `IPasswordResetTokenRepository`

## Regras
- Senha nunca em claro — hash via `IPasswordHasher`
- Rate limit em `register` (5 req/15min)
- Token de reset single-use com TTL 15min; expirado/reutilizado rejeitado
- Após reset, todos os refresh tokens do usuário são revogados
- Papel padrão no registro: **Member**