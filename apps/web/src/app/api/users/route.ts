// Path: apps/web/src/app/api/users/route.ts
// Listagem de usuários (painel admin) — somente administrator.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractBearerToken, requireRole, verifyJwt } from '@digimon/auth'
import { ListUsersUseCase } from '@digimon/users'
import { authDeps, usersDeps } from '@/lib/server/container'
import { handleError, readAccessToken } from '@/lib/server/http'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = readAccessToken(request) ?? extractBearerToken(request.headers.get('authorization'))
    const ctx = verifyJwt(authDeps().tokens, token)
    requireRole(ctx, 'administrator')

    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const deps = usersDeps()
    const result = await new ListUsersUseCase(deps).execute(ctx.userId, params)
    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
}
