// Path: packages/modules/auth/src/use-cases/register/register-use-case.ts
// Cria conta de usuário (papel padrão: member), valida senha forte (Zod),
// hasheia a senha e emite a sessão inicial (access + refresh).
import type { EventBus, Role } from '@digimon/contracts'
import { ConflictError } from '@digimon/contracts'
import type { PasswordHasher } from '../../domain/services/password-hasher'
import type { TokenService } from '../../domain/services/token-service'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import type { UserAccountRepository } from '../../domain/repositories/user-account-repository'
import { RefreshToken } from '../../domain/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from '../../domain/constants'
import { userCreatedEvent } from '../../domain/events/auth-events'
import { registerSchema, type AuthSession } from '../schemas'
import { toAuthUserView } from '../user-view'
import { parseOrThrow } from '../parse-or-throw'

export interface RegisterUseCaseDeps {
  users: UserAccountRepository
  refreshTokens: RefreshTokenRepository
  passwordHasher: PasswordHasher
  tokens: TokenService
  eventBus: EventBus
  now?: () => Date
}

export class RegisterUseCase {
  constructor(private readonly deps: RegisterUseCaseDeps) {}

  async execute(input: unknown): Promise<AuthSession> {
    const data = parseOrThrow(registerSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const existing = await this.deps.users.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('Email já cadastrado')
    }

    const passwordHash = await this.deps.passwordHasher.hash(data.password)
    const user = await this.deps.users.create({
      email: data.email,
      name: data.name,
      passwordHash,
      role: 'member'
    })

    const refresh = this.deps.tokens.issueRefreshToken()
    const refreshToken = RefreshToken.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS)
    })
    await this.deps.refreshTokens.create(refreshToken)

    await this.deps.eventBus.publish(userCreatedEvent({ userId: user.id, email: user.email, role: user.role }))

    return {
      accessToken: this.deps.tokens.signAccessToken(user.id, user.role as Role),
      refreshToken: refresh.token,
      refreshTokenHash: refresh.tokenHash,
      user: toAuthUserView(user)
    }
  }
}
