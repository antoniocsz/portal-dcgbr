// Path: packages/modules/auth/src/infra/http/verify-jwt.ts
// Middleware de autenticação para route handlers: valida o access token e
// injeta { userId, role } no contexto. Agnóstico de framework — recebe o
// header/cookie já lido pelo route handler (composition root).
import type { Role } from '@digimon/contracts'
import { ForbiddenError, UnauthorizedError } from '@digimon/contracts'
import type { TokenService } from '../../domain/services/token-service'

export interface AuthContext {
  userId: string
  role: Role
}

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'

/** Extrai o token do header Authorization (Bearer ...). Retorna null se ausente. */
export function extractBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }
  const token = authorization.slice('Bearer '.length).trim()
  return token.length > 0 ? token : null
}

/** Verifica o access token (string ou null) e retorna o contexto autenticado. */
export function verifyJwt(tokens: TokenService, token: string | null): AuthContext {
  if (!token) {
    throw new UnauthorizedError('Não autenticado')
  }
  return tokens.verifyAccessToken(token)
}

/** Autorização por papel (RBAC simples, ADR-004: papéis globais fixos). */
export function requireRole(context: AuthContext, role: Role | Role[]): void {
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(context.role)) {
    throw new ForbiddenError('Sem permissão para esta ação')
  }
}
