// Path: apps/web/src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LoginUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { attachSessionCookies, handleError } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const deps = authDeps()
    const session = await new LoginUseCase(deps).execute(body)
    const response = NextResponse.json({ user: session.user })
    return attachSessionCookies(response, session.accessToken, session.refreshToken)
  } catch (error) {
    return handleError(error)
  }
}
