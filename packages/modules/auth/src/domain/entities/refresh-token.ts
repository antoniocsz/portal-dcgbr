// Path: packages/modules/auth/src/domain/entities/refresh-token.ts
// Sessão de autenticação: refresh token com rotation e revogação (ADR-002).
// O token em si nunca é persistido — apenas tokenHash (SHA-256).
import type { EntityId } from '@digimon/contracts'

export interface RefreshTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
  revokedAt: Date | null
  createdAt: Date
}

export interface CreateRefreshTokenData {
  id: string
  userId: string
  tokenHash: string
  expiresAt: Date
}

export class RefreshToken {
  private constructor(public readonly data: RefreshTokenData) {}

  static create(props: CreateRefreshTokenData): RefreshToken {
    const now = new Date()
    return new RefreshToken({
      ...props,
      revokedAt: null,
      createdAt: now
    })
  }

  static fromData(data: RefreshTokenData): RefreshToken {
    return new RefreshToken(data)
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

  get isRevoked(): boolean {
    return this.data.revokedAt !== null
  }

  /** Rotation/revogação: marca o token como revogado (token antigo rejeitado). */
  revoke(now: Date = new Date()): void {
    if (this.data.revokedAt === null) {
      this.data.revokedAt = now
    }
  }
}
