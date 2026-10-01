// Path: packages/modules/auth/src/infra/repositories/prisma-refresh-token-repository.ts
// Implementação Prisma de RefreshTokenRepository.
import type { PrismaClient } from '@digimon/database'
import type { RefreshTokenRepository } from '../../domain/repositories/refresh-token-repository'
import { RefreshToken } from '../../domain/entities/refresh-token'

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(token: RefreshToken): Promise<void> {
    const { id, userId, tokenHash, expiresAt, revokedAt, createdAt } = token.data
    await this.prisma.refreshToken.create({
      data: { id, userId, tokenHash, expiresAt, revokedAt, createdAt }
    })
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } })
    if (!row) return null
    return RefreshToken.fromData({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt
    })
  }

  async revoke(id: string, revokedAt: Date = new Date()): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revokedAt } })
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }
}
