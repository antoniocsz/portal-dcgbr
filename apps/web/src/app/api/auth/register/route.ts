// Path: apps/web/src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RegisterUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { attachSessionCookies, handleError, registerAllowed } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (!registerAllowed(request)) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente novamente em 15 minutos.' } },
        { status: 429 }
      )
    }
    const body = (await request.json()) as Record<string, unknown>
    const deps = authDeps()
    const session = await new RegisterUseCase(deps).execute(body)
    const response = NextResponse.json({ user: session.user }, { status: 201 })
    return attachSessionCookies(response, session.accessToken, session.refreshToken)
  } catch (error) {
    return handleError(error)
  }
}
