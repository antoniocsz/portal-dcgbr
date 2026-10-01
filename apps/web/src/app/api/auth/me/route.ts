// Path: apps/web/src/app/api/auth/me/route.ts
// GET /api/auth/me — usuário da sessão atual (id, role, name, email) ou null.
// Usado pelo header público para exibir o indicador de sessão (avatar dropdown).
// Não exige autenticação: sem token/cookie inválido responde { user: null }.
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, verifyJwt } from '@digimon/auth'
import { GetProfileUseCase } from '@digimon/users'
import type { Role } from '@digimon/contracts'
import { authDeps, usersDeps } from '@/lib/server/container'

export interface MeResponse {
  user: {
    id: string
    role: Role
    name: string
    email: string
  } | null
}

export async function GET(): Promise<NextResponse<MeResponse>> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  if (!token) {
    return NextResponse.json({ user: null })
  }
  try {
    const context = verifyJwt(authDeps().tokens, token)
    const profile = await new GetProfileUseCase(usersDeps()).execute(context.userId)
    return NextResponse.json({
      user: {
        id: context.userId,
        role: context.role,
        name: profile.name,
        email: profile.email
      }
    })
  } catch {
    // Token inválido/expirado ou usuário removido — trata como deslogado
    return NextResponse.json({ user: null })
  }
}
