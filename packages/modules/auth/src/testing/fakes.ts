// Path: packages/modules/auth/src/testing/fakes.ts
// Fakes para testes unitários — repositórios in-memory + services determinísticos.
// Intercambiáveis com as implementações Prisma (LSP).
import { createHash, randomBytes } from 'node:crypto'
import type { Role } from '@digimon/contracts'
import type { RefreshToken } from '../domain/entities/refresh-token'
import type { PasswordResetToken } from '../domain/entities/password-reset-token'
import type { RefreshTokenRepository } from '../domain/repositories/refresh-token-repository'
import type { PasswordResetTokenRepository } from '../domain/repositories/password-reset-token-repository'
import type { UserAccountRecord, UserAccountRepository, CreateUserAccountInput } from '../domain/repositories/user-account-repository'
import type { PasswordHasher } from '../domain/services/password-hasher'
import type { IssuedRefreshToken, TokenService, AccessTokenPayload } from '../domain/services/token-service'

export class InMemoryUserAccountRepository implements UserAccountRepository {
  private readonly users = new Map<string, UserAccountRecord>()

  seed(user: UserAccountRecord): void {
    this.users.set(user.id, user)
  }

  async findById(id: string): Promise<UserAccountRecord | null> {
    return this.users.get(id) ?? null
  }

  async findByEmail(email: string): Promise<UserAccountRecord | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async create(data: CreateUserAccountInput): Promise<UserAccountRecord> {
    const user: UserAccountRecord = {
      id: randomBytes(8).toString('hex'),
      email: data.email,
      name: data.name,
      avatarUrl: null,
      passwordHash: data.passwordHash,
      role: data.role,
      status: 'active',
      emailVerifiedAt: null
    }
    this.users.set(user.id, user)
    return user
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = this.users.get(id)
    if (user) this.users.set(id, { ...user, passwordHash })
  }
}

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private readonly tokens = new Map<string, RefreshToken>()

  async create(token: RefreshToken): Promise<void> {
    this.tokens.set(token.id, token)
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    for (const token of this.tokens.values()) {
      if (token.tokenHash === tokenHash) return token
    }
    return null
  }

  async revoke(id: string, _revokedAt: Date = new Date()): Promise<void> {
    const token = this.tokens.get(id)
    if (token) token.revoke(_revokedAt)
  }

  async revokeAllForUser(userId: string): Promise<void> {
    for (const token of this.tokens.values()) {
      if (token.data.userId === userId) token.revoke()
    }
  }
}

export class InMemoryPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private readonly tokens = new Map<string, PasswordResetToken>()

  async create(token: PasswordResetToken): Promise<void> {
    this.tokens.set(token.id, token)
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    for (const token of this.tokens.values()) {
      if (token.tokenHash === tokenHash) return token
    }
    return null
  }

  async markUsed(id: string, usedAt: Date = new Date()): Promise<void> {
    const token = this.tokens.get(id)
    if (token) token.markUsed(usedAt)
  }
}

export class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `fake$${createHash('sha256').update(password).digest('hex')}`
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `fake$${createHash('sha256').update(password).digest('hex')}`
  }
}

let counter = 0

export class FakeTokenService implements TokenService {
  signAccessToken(userId: string, role: Role): string {
    return `access.${userId}.${role}.${++counter}`
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const parts = token.split('.')
    if (parts.length !== 4) throw new Error('invalid')
    return { userId: parts[1] ?? '', role: (parts[2] ?? 'member') as Role }
  }

  issueRefreshToken(): IssuedRefreshToken {
    const token = `refresh.${++counter}`
    return { token, tokenHash: this.hashToken(token) }
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
