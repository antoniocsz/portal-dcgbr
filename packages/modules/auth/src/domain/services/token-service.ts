// Path: packages/modules/auth/src/domain/services/token-service.ts
// Emissão/verificação de tokens (ADR-002): access JWT curto + refresh com rotation.
// Refresh token nunca é persistido em claro — apenas tokenHash (SHA-256).
import type { Role } from '@digimon/contracts'

export interface AccessTokenPayload {
  userId: string
  role: Role
}

export interface IssuedRefreshToken {
  token: string
  tokenHash: string
}

export interface TokenService {
  signAccessToken(userId: string, role: Role): string
  verifyAccessToken(token: string): AccessTokenPayload
  issueRefreshToken(): IssuedRefreshToken
  hashToken(token: string): string
}
