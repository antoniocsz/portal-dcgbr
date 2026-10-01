// Path: packages/modules/auth/src/domain/entities/password-reset-token.ts
// Token de recuperação de senha: single-use com TTL (15min).
// Armazenado apenas como tokenHash (SHA-256); expirado/reutilizado rejeitado.
import type { EntityId } from '@digimon/contracts'

export interface PasswordResetTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  usedAt: Date | null
  createdAt: Date
}

export interface CreatePasswordResetTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
}

export class PasswordResetToken {
  private constructor(public readonly data: PasswordResetTokenData) {}

  static create(props: CreatePasswordResetTokenData): PasswordResetToken {
    const now = new Date()
    return new PasswordResetToken({
      ...props,
      usedAt: null,
      createdAt: now
    })
  }

  static fromData(data: PasswordResetTokenData): PasswordResetToken {
    return new PasswordResetToken(data)
  }

  get id(): string {
    return this.data.id
  }

  get userId(): EntityId {
    return this.data.userId as EntityId
  }

  get tokenHash(): string {
    return this.data.tokenHash
  }

  get isExpired(): boolean {
    return this.data.expiresAt.getTime() <= Date.now()
  }

  get isUsed(): boolean {
    return this.data.usedAt !== null
  }

  /** Marca como usado — token single-use: reutilização rejeitada. */
  markUsed(now: Date = new Date()): void {
    if (this.data.usedAt === null) {
      this.data.usedAt = now
    }
  }
}
