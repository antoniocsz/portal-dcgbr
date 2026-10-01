// Path: apps/web/src/app/api/users/me/route.ts
// Perfil do usuário logado (GET) e atualização de nome/avatar (PATCH).
// Protegido por verify-jwt.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractBearerToken, verifyJwt } from '@digimon/auth'
import { GetProfileUseCase, UpdateProfileUseCase } from '@digimon/users'
import { authDeps, usersDeps } from '@/lib/server/container'
import { handleError, readAccessToken } from '@/lib/server/http'

function getAuth(request: NextRequest) {
  const token = readAccessToken(request) ?? extractBearerToken(request.headers.get('authorization'))
  return verifyJwt(authDeps().tokens, token)
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = getAuth(request)
    const deps = usersDeps()
    const user = await new GetProfileUseCase(deps).execute(ctx.userId)
    return NextResponse.json({ user })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const ctx = getAuth(request)
    const body = (await request.json()) as Record<string, unknown>
    const deps = usersDeps()
    const user = await new UpdateProfileUseCase(deps).execute(ctx.userId, body)
    return NextResponse.json({ user })
  } catch (error) {
    return handleError(error)
  }
}
