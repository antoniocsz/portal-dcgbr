// Path: apps/api/src/plugins/auth.ts
// Hook Fastify de sessão: lê o access token do cookie httpOnly (access_token)
// ou do header Authorization: Bearer, valida via @digimon/auth (verifyJwt) e
// expõe request.auth = { userId, role }.
// Porte do comportamento de apps/web/src/lib/server + apps/web/src/app/api/**/_lib/session.ts
// (strangler, ADR-007). O registro do hook nas rotas acontece na fase de handlers.
import type { FastifyRequest, preHandlerHookHandler } from 'fastify'
import type { AuthContext } from '@digimon/auth'
import { ACCESS_TOKEN_COOKIE, extractBearerToken, requireRole, verifyJwt } from '@digimon/auth'
import { authDeps } from '../container'
import { readCookie } from '../http/cookies'

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext
  }
}

/** Token da sessão: cookie httpOnly tem precedência; fallback Bearer. */
export function readSessionToken(request: FastifyRequest): string | null {
  const fromCookie = readCookie(request, ACCESS_TOKEN_COOKIE)
  if (fromCookie) return fromCookie
  return extractBearerToken(request.headers.authorization ?? null)
}

/** Valida a sessão e retorna o contexto; lança UnauthorizedError se ausente/inválido. */
export function getAuthContext(request: FastifyRequest): AuthContext {
  return verifyJwt(authDeps().tokens, readSessionToken(request))
}

/** preHandler: exige sessão válida e injeta request.auth (401 se ausente). */
export const authenticate: preHandlerHookHandler = async (request) => {
  request.auth = getAuthContext(request)
}

/** preHandler: exige sessão + papel (RBAC global, ADR-004); 403 se sem permissão. */
export function requireRoleHook(role: AuthContext['role'] | AuthContext['role'][]): preHandlerHookHandler {
  return async (request) => {
    const context = request.auth ?? getAuthContext(request)
    requireRole(context, role)
  }
}
