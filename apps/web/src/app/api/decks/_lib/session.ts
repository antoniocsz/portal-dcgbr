// Path: apps/web/src/app/api/decks/_lib/session.ts
// Sessão JWT dos route handlers de decks: lê o access token do cookie httpOnly
// (readAccessToken — cookie `access_token`, emitido pelo módulo auth, task 02)
// e valida com o TokenService real do @digimon/auth (verifyJwt).
import type { NextRequest } from 'next/server'
import { verifyJwt } from '@digimon/auth'
import type { Role } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import { authDeps } from '@/lib/server/container'
import { readAccessToken } from '@/lib/server/http'

export interface SessionUser {
  id: string
  role: Role
}

export function getSessionUser(request: NextRequest): SessionUser | null {
  const token = readAccessToken(request)
  if (!token) return null
  try {
    const context = verifyJwt(authDeps().tokens, token)
    return { id: context.userId, role: context.role }
  } catch (error) {
    if (error instanceof UnauthorizedError) return null
    throw error
  }
}

export function requireUser(request: NextRequest): SessionUser {
  const user = getSessionUser(request)
  if (!user) throw new UnauthorizedError('Não autenticado')
  return user
}
