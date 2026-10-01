// Path: apps/web/src/app/api/cards/_lib/session.ts
// Sessão JWT dos route handlers de cartas: lê o access token do cookie httpOnly
// e valida com o TokenService real do @digimon/auth. Escrita exige administrator.
import type { NextRequest } from 'next/server'
import { requireRole, verifyJwt } from '@digimon/auth'
import type { CardActor } from '@digimon/cards'
import { UnauthorizedError } from '@digimon/contracts'
import { authDeps } from '@/lib/server/container'
import { readAccessToken } from '@/lib/server/http'

export function getSessionUser(request: NextRequest): CardActor | null {
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

export function requireAdminUser(request: NextRequest): CardActor {
  const user = getSessionUser(request)
  if (!user) throw new UnauthorizedError('Não autenticado')
  requireRole({ userId: user.id, role: user.role }, 'administrator')
  return user
}
