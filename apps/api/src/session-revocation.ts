// Path: apps/api/src/session-revocation.ts
// Registry em memória (process-local) de sessões revogadas por userId.
// Motivação: o access token é um JWT stateless (ADR-002) — continua válido até
// expirar mesmo após revogarmos os refresh tokens (ex.: exclusão de conta em
// DELETE /users/me). Aqui guardamos `userId → expiraEm` com TTL igual à duração
// do access token; o getAuthContext (plugins/auth.ts) rejeita tokens de sessões
// revogadas enquanto o registro estiver vigente.
//
// Limitações conhecidas (ADR-005: sem Redis/cache externo na v1):
// - O registro some em restart da API (memória de processo).
// - Vale apenas para um único processo (não é compartilhado entre réplicas).
// - A revogação é por usuário: invalida TODOS os access tokens do titular até o
//   TTL, não apenas um token específico (aceitável — o access token dura 15min).
import { ACCESS_TOKEN_TTL_MS } from '@digimon/auth'

/** userId → timestamp (epoch ms) até o qual a sessão permanece revogada. */
const revokedUntil = new Map<string, number>()

/** Expurgo preguiçoso: descarta entradas já expiradas antes de inserir. */
function purgeExpired(now: number): void {
  for (const [userId, expiresAt] of revokedUntil) {
    if (expiresAt <= now) revokedUntil.delete(userId)
  }
}

/** Marca a sessão do usuário como revogada pelo TTL do access token. */
export function revokeSession(userId: string): void {
  const now = Date.now()
  purgeExpired(now)
  revokedUntil.set(userId, now + ACCESS_TOKEN_TTL_MS)
}

/** Indica se o usuário ainda tem sessão revogada (sem expurgo global). */
export function isSessionRevoked(userId: string): boolean {
  const expiresAt = revokedUntil.get(userId)
  if (expiresAt === undefined) return false
  if (expiresAt <= Date.now()) {
    revokedUntil.delete(userId)
    return false
  }
  return true
}
