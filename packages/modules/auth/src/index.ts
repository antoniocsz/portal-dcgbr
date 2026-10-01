// Barrel público de @digimon/auth — única porta de entrada do pacote.
// Infra Prisma/middleware exportada para composição no apps/web (composition root).

// Domínio
export * from './domain/constants'
export * from './domain/entities/refresh-token'
export * from './domain/entities/password-reset-token'
export * from './domain/events/auth-events'
export * from './domain/repositories/refresh-token-repository'
export * from './domain/repositories/password-reset-token-repository'
export * from './domain/repositories/user-account-repository'
export * from './domain/services/password-hasher'
export * from './domain/services/token-service'

// Use cases
export * from './use-cases/schemas'
export * from './use-cases/user-view'
export * from './use-cases/register/register-use-case'
export * from './use-cases/login/login-use-case'
export * from './use-cases/refresh-token/refresh-token-use-case'
export * from './use-cases/logout/logout-use-case'
export * from './use-cases/forgot-password/forgot-password-use-case'
export * from './use-cases/reset-password/reset-password-use-case'

// Infra (services, repositórios, middleware)
export * from './infra/services/scrypt-password-hasher'
export * from './infra/services/jwt-token-service'
export * from './infra/repositories/prisma-refresh-token-repository'
export * from './infra/repositories/prisma-password-reset-token-repository'
export * from './infra/http/verify-jwt'
export * from './infra/http/rate-limit'
