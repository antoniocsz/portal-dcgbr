// Path: packages/modules/auth/src/infra/repositories/prisma-password-reset-token-repository.ts
// Implementação Prisma de PasswordResetTokenRepository.
import type { PrismaClient } from '@digimon/database'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token-repository'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(token: PasswordResetToken): Promise<void> {
    const { id, userId, tokenHash, expiresAt, usedAt, createdAt } = token.data
    await this.prisma.passwordResetToken.create({
      data: { id, userId, tokenHash, expiresAt, usedAt, createdAt }
    })
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const row = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!row) return null
    return PasswordResetToken.fromData({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt,
      createdAt: row.createdAt
    })
  }

  async markUsed(id: string, usedAt: Date = new Date()): Promise<void> {
    await this.prisma.passwordResetToken.update({ where: { id }, data: { usedAt } })
  }
}
