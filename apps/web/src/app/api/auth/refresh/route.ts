// Path: apps/web/src/app/api/auth/refresh/route.ts
// Rotation: lê o refresh token do cookie, rotaciona e devolve novo par.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RefreshTokenUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { attachSessionCookies, handleError, readRefreshToken } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const refreshToken = readRefreshToken(request)
    const deps = authDeps()
    const session = await new RefreshTokenUseCase(deps).execute({ refreshToken: refreshToken ?? '' })
    const response = NextResponse.json({ user: session.user })
    return attachSessionCookies(response, session.accessToken, session.refreshToken)
  } catch (error) {
    return handleError(error)
  }
}
