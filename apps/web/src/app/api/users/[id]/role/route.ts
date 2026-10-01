// Path: apps/web/src/app/api/users/[id]/role/route.ts
// Atribuição de papel — somente administrator (regra do módulo users).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractBearerToken, requireRole, verifyJwt } from '@digimon/auth'
import { AssignRoleUseCase } from '@digimon/users'
import { authDeps, usersDeps } from '@/lib/server/container'
import { handleError, readAccessToken } from '@/lib/server/http'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const token = readAccessToken(request) ?? extractBearerToken(request.headers.get('authorization'))
    const ctx = verifyJwt(authDeps().tokens, token)
    requireRole(ctx, 'administrator')

    const { id } = await context.params
    const body = (await request.json()) as Record<string, unknown>
    const deps = usersDeps()
    const user = await new AssignRoleUseCase(deps).execute(ctx.userId, id, body)
    return NextResponse.json({ user })
  } catch (error) {
    return handleError(error)
  }
}
