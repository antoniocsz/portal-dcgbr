// Path: apps/web/src/app/api/auth/logout/route.ts
// Revoga o refresh token e limpa os cookies de sessão.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LogoutUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { clearSessionCookies, handleError, readRefreshToken } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = readRefreshToken(request)
    const deps = authDeps()
    await new LogoutUseCase(deps).execute({ refreshToken: refreshToken ?? '' })
    return clearSessionCookies()
  } catch (error) {
    return handleError(error)
  }
}
