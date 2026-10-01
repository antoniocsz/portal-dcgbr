// Path: packages/modules/auth/src/use-cases/reset-password/reset-password-use-case.ts
// Valida token de reset (single-use, TTL 15min), troca o hash e revoga TODOS
// os refresh tokens do usuário (força novo login).
import type { EventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import type { PasswordHasher } from '../../domain/services/password-hasher'
import type { TokenService } from '../../domain/services/token-service'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token-repository'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import type { UserAccountRepository } from '../../domain/repositories/user-account-repository'
import { passwordResetEvent } from '../../domain/events/auth-events'
import { resetPasswordSchema } from '../schemas'
import { parseOrThrow } from '../parse-or-throw'

export interface ResetPasswordUseCaseDeps {
  users: UserAccountRepository
  passwordResetTokens: PasswordResetTokenRepository
  refreshTokens: RefreshTokenRepository
  passwordHasher: PasswordHasher
  tokens: TokenService
  eventBus: EventBus
  now?: () => Date
}

export class ResetPasswordUseCase {
  constructor(private readonly deps: ResetPasswordUseCaseDeps) {}

  async execute(input: unknown): Promise<{ ok: true }> {
    const data = parseOrThrow(resetPasswordSchema, input)
    const now = this.deps.now?.() ?? new Date()

    const tokenHash = this.deps.tokens.hashToken(data.token)
    const resetToken = await this.deps.passwordResetTokens.findByTokenHash(tokenHash)

    if (!resetToken || resetToken.isUsed || resetToken.isExpired) {
      throw new ValidationError('Token inválido, expirado ou já utilizado')
    }

    const user = await this.deps.users.findById(resetToken.userId)
    if (!user) {
      throw new ValidationError('Token inválido, expirado ou já utilizado')
    }

    const passwordHash = await this.deps.passwordHasher.hash(data.password)
    await this.deps.users.updatePassword(user.id, passwordHash)
    await this.deps.passwordResetTokens.markUsed(resetToken.id, now)
    await this.deps.refreshTokens.revokeAllForUser(user.id)

    await this.deps.eventBus.publish(passwordResetEvent(user.id))

    return { ok: true }
  }
}
