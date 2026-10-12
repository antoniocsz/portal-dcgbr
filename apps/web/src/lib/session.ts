// Path: apps/web/src/lib/session.ts
// Sessão lida no SERVIDOR (App Router): valida o access_token httpOnly com o
// TokenService de @digimon/auth. Sem hooks/JSX/banco (o web não fala com Prisma —
// ADR-007). Uso restrito a Server Components (importa next/headers).
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, JwtTokenService, verifyJwt } from '@digimon/auth'
import type { Role } from '@digimon/contracts'

export interface CurrentSession {
  userId: string
  role: Role
}

function tokensFromEnv(): JwtTokenService | null {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) return null
  return new JwtTokenService(secret)
}

/** Sessão atual (do cookie httpOnly) ou null — nunca lança. */
export async function getSession(): Promise<CurrentSession | null> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  if (!token) return null

  const tokens = tokensFromEnv()
  if (!tokens) return null

  try {
    const context = verifyJwt(tokens, token)
    return { userId: context.userId, role: context.role }
  } catch {
    return null
  }
}
