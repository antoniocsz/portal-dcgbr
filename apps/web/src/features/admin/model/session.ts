// Path: apps/web/src/features/admin/model/session.ts
// Sessão do painel admin lida no servidor (App Router): valida o access token
// httpOnly com o TokenService de @digimon/auth. Sem hooks, sem JSX (Model).
// Sem container/banco: o web não fala com o Prisma; o perfil (nome) vem da API
// separada (ADR-007). Não exportado pelo barrel — uso restrito a Server Components.
import { cookies, headers } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, JwtTokenService, verifyJwt } from '@digimon/auth'
import type { Role } from '@digimon/contracts'
import { apiBaseUrl } from '@/lib/api-base'

export interface AdminSession {
  userId: string
  role: Role
}

export interface SessionProfile {
  id: string
  role: Role
  name: string
  email: string
}

/** TokenService com o JWT_SECRET do processo; null se ausente/curto (não derruba a página). */
function tokensFromEnv(): JwtTokenService | null {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) return null
  return new JwtTokenService(secret)
}

export async function getAdminSession(): Promise<AdminSession | null> {
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

/** Perfil atual via GET /auth/me, encaminhando o cookie da requisição. */
export async function fetchCurrentUser(): Promise<SessionProfile | null> {
  const headerList = await headers()
  const cookie = headerList.get('cookie')

  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, {
      cache: 'no-store',
      ...(cookie ? { headers: { cookie } } : {})
    })
    if (!response.ok) return null
    const body = (await response.json()) as { user: SessionProfile | null }
    return body.user
  } catch {
    return null
  }
}
