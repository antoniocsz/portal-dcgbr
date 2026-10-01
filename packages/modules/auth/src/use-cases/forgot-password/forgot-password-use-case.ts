// Path: packages/modules/auth/src/use-cases/forgot-password/forgot-password-use-case.ts
// Gera token de reset (TTL 15min, single-use). Resposta genérica: não revela
// se o email existe (anti enumeração de contas).
import type { EventBus } from '@digimon/contracts'
import type { TokenService } from '../../domain/services/token-service'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token-repository'
import type { UserAccountRepository } from '../../domain/repositories/user-account-repository'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { PASSWORD_RESET_TOKEN_TTL_MS } from '../../domain/constants'
import { passwordResetRequestedEvent } from '../../domain/events/auth-events'
import { forgotPasswordSchema } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface ForgotPasswordUseCaseDeps {
  users: UserAccountRepository
  passwordResetTokens: PasswordResetTokenRepository
  tokens: TokenService
  eventBus: EventBus
  now?: () => Date
}

export class ForgotPasswordUseCase {
  constructor(private readonly deps: ForgotPasswordUseCaseDeps) {}

  async execute(input: unknown): Promise<{ ok: true }> {
    const data = parseOrThrow(forgotPasswordSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const user = await this.deps.users.findByEmail(data.email)
    if (user) {
      const reset = this.deps.tokens.issueRefreshToken() // mesmo formato (hash SHA-256)
      const resetToken = PasswordResetToken.create({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash: reset.tokenHash,
        expiresAt: new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MS)
      })
      await this.deps.passwordResetTokens.create(resetToken)
      await this.deps.eventBus.publish(passwordResetRequestedEvent(user.id))
    }
    // Resposta genérica mesmo quando o email não existe.
    return { ok: true }
  }
}
