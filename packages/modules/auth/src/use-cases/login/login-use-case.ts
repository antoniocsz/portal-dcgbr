// Path: packages/modules/auth/src/use-cases/login/login-use-case.ts
// Valida credenciais e emite sessão (access + refresh). Mensagem genérica
// para não revelar se o email existe; roda verify mesmo quando o usuário não
// existe (mitiga timing attack).
import type { Role } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import type { PasswordHasher } from '../../domain/services/password-hasher'
import type { TokenService } from '../../domain/services/token-service'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import type { UserAccountRepository } from '../../domain/repositories/user-account-repository'
import { RefreshToken } from '../../domain/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from '../../domain/constants'
import { loginSchema, type AuthSession } from '../schemas'
import { toAuthUserView } from '../user-view'
import { parseOrThrow } from '../parse-or-throw'

const DUMMY_HASH = 'scrypt$dummy$0000000000000000000000000000000000000000000000000000000000000000'

export interface LoginUseCaseDeps {
  users: UserAccountRepository
  refreshTokens: RefreshTokenRepository
  passwordHasher: PasswordHasher
  tokens: TokenService
  now?: () => Date
}

export class LoginUseCase {
  constructor(private readonly deps: LoginUseCaseDeps) {}

  async execute(input: unknown): Promise<AuthSession> {
    const data = parseOrThrow(loginSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const user = await this.deps.users.findByEmail(data.email)
    if (!user) {
      // Timing attack: sempre roda o verify mesmo sem usuário.
      await this.deps.passwordHasher.verify(data.password, DUMMY_HASH)
      throw new UnauthorizedError('Email ou senha inválidos')
    }

    const valid = await this.deps.passwordHasher.verify(data.password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedError('Email ou senha inválidos')
    }

    const refresh = this.deps.tokens.issueRefreshToken()
    const refreshToken = RefreshToken.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS)
    })
    await this.deps.refreshTokens.create(refreshToken)

    return {
      accessToken: this.deps.tokens.signAccessToken(user.id, user.role as Role),
      refreshToken: refresh.token,
      refreshTokenHash: refresh.tokenHash,
      user: toAuthUserView(user)
    }
  }
}
