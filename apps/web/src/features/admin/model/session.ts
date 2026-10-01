// Path: apps/web/src/features/admin/model/session.ts
// Sessão do painel admin lida no servidor (App Router): valida o access token
// httpOnly com o TokenService de @digimon/auth. Sem hooks, sem JSX (Model).
// Não exportado pelo barrel da feature — uso restrito a Server Components.
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, verifyJwt } from '@digimon/auth'
import type { Role } from '@digimon/contracts'
import { authDeps } from '@/lib/server/container'

export interface AdminSession {
  userId: string
  role: Role
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  if (!token) return null
  try {
    const context = verifyJwt(authDeps().tokens, token)
    return { userId: context.userId, role: context.role }
  } catch {
    return null
  }
}
