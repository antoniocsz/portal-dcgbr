// Path: packages/modules/auth/src/use-cases/logout/logout-use-case.ts
// Revoga o refresh token da sessão corrente. Idempotente: sessão inexistente
// ou já revogada não é erro.
import type { TokenService } from '../../domain/services/token-service'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import { refreshTokenSchema } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface LogoutUseCaseDeps {
  refreshTokens: RefreshTokenRepository
  tokens: TokenService
  now?: () => Date
}

export class LogoutUseCase {
  constructor(private readonly deps: LogoutUseCaseDeps) {}

  async execute(input: unknown): Promise<{ ok: true }> {
    const data = parseOrThrow(refreshTokenSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const tokenHash = this.deps.tokens.hashToken(data.refreshToken)
    const current = await this.deps.refreshTokens.findByTokenHash(tokenHash)
    if (current && !current.isRevoked) {
      await this.deps.refreshTokens.revoke(current.id, now)
    }
    return { ok: true }
  }
}
