// Path: packages/modules/auth/src/domain/repositories/password-reset-token-repository.ts
// Interface do repositório de tokens de reset de senha — single-use com TTL.
import type { PasswordResetToken } from '../entities/password-reset-token'

export interface PasswordResetTokenRepository {
  create(token: PasswordResetToken): Promise<void>
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>
  markUsed(id: string, usedAt?: Date): Promise<void>
}
