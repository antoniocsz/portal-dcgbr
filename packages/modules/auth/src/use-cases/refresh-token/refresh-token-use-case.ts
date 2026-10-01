// Path: packages/modules/auth/src/use-cases/refresh-token/refresh-token-use-case.ts
// Rotation do refresh token: token antigo é revogado e rejeitado; emite novo par.
import type { Role } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import type { TokenService } from '../../domain/services/token-service'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import type { UserAccountRepository } from '../../domain/repositories/user-account-repository'
import { RefreshToken } from '../../domain/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from '../../domain/constants'
import { refreshTokenSchema, type AuthSession } from '../schemas'
import { toAuthUserView } from '../user-view'
import { parseOrThrow } from '../parse-or-throw'

export interface RefreshTokenUseCaseDeps {
  users: UserAccountRepository
  refreshTokens: RefreshTokenRepository
  tokens: TokenService
  now?: () => Date
}

export class RefreshTokenUseCase {
  constructor(private readonly deps: RefreshTokenUseCaseDeps) {}

  async execute(input: unknown): Promise<AuthSession> {
    const data = parseOrThrow(refreshTokenSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const tokenHash = this.deps.tokens.hashToken(data.refreshToken)
    const current = await this.deps.refreshTokens.findByTokenHash(tokenHash)

    if (!current) {
      throw new UnauthorizedError('Sessão inválida')
    }
    if (current.isRevoked) {
      throw new UnauthorizedError('Sessão inválida (token reutilizado)')
    }
    if (current.isExpired) {
      await this.deps.refreshTokens.revoke(current.id, now)
      throw new UnauthorizedError('Sessão expirada')
    }

    const user = await this.deps.users.findById(current.userId)
    if (!user) {
      throw new UnauthorizedError('Sessão inválida')
    }

    // Rotation: revoga o token atual e emite um novo.
    await this.deps.refreshTokens.revoke(current.id, now)

    const refresh = this.deps.tokens.issueRefreshToken()
    const next = RefreshToken.create({
      id: crypto.randomUUID(),
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS)
    })
    await this.deps.refreshTokens.create(next)

    return {
      accessToken: this.deps.tokens.signAccessToken(user.id, user.role as Role),
      refreshToken: refresh.token,
      refreshTokenHash: refresh.tokenHash,
      user: toAuthUserView(user)
    }
  }
}
