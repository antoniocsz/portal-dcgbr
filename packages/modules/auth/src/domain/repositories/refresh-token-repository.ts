// Path: packages/modules/auth/src/domain/repositories/refresh-token-repository.ts
// Interface do repositório de refresh tokens — implementações: Prisma (infra) e in-memory (testes).
// Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { RefreshToken } from '../entities/refresh-token'

export interface RefreshTokenRepository {
  create(token: RefreshToken): Promise<void>
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>
  revoke(id: string, revokedAt?: Date): Promise<void>
  revokeAllForUser(userId: string): Promise<void>
}
