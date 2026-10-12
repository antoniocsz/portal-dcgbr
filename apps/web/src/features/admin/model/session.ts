// Path: apps/web/src/features/admin/model/session.ts
// Sessão do painel admin lida no servidor (App Router). Delega a checagem
// genérica de sessão a @/lib/session (valida o access_token httpOnly). Sem
// hooks, sem JSX (Model). Sem container/banco: o web não fala com o Prisma; o
// perfil (nome) vem da API separada (ADR-007). Não exportado pelo barrel —
// uso restrito a Server Components.
import { headers } from 'next/headers'
import type { Role } from '@digimon/contracts'
import { apiBaseUrl } from '@/lib/api-base'
import { getSession } from '@/lib/session'

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

/** Sessão atual (cookie httpOnly). Qualquer papel válido — o gate de role é na rota. */
export async function getAdminSession(): Promise<AdminSession | null> {
  return getSession()
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
