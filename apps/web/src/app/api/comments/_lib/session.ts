// apps/web/src/app/api/comments/_lib/session.ts
// Obtém o ator autenticado (CommentActor { userId, role }) da requisição via
// verify-jwt (@digimon/auth, task 02): lê o access token do cookie httpOnly
// (readAccessToken) ou do header Authorization: Bearer (extractBearerToken).
// Sem token → null (anônimo, regra: anônimo não comenta). Token inválido ou
// expirado → UnauthorizedError (401).

import type { NextRequest } from 'next/server'
import { extractBearerToken, verifyJwt } from '@digimon/auth'
import type { CommentActor } from '@digimon/comments'
import { authDeps } from '@/lib/server/container'
import { readAccessToken } from '@/lib/server/http'

export function getSessionUser(request: NextRequest): CommentActor | null {
  const token = readAccessToken(request) ?? extractBearerToken(request.headers.get('authorization'))
  if (!token) return null
  return verifyJwt(authDeps().tokens, token)
}
