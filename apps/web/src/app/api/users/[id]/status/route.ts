// Path: apps/web/src/app/api/users/[id]/status/route.ts
// Ativa/desativa conta — somente administrator.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractBearerToken, requireRole, verifyJwt } from '@digimon/auth'
import { ActivateUserUseCase, DeactivateUserUseCase } from '@digimon/users'
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
    const body = (await request.json()) as { status?: string }
    const deps = usersDeps()

    if (body.status === 'active') {
      const user = await new ActivateUserUseCase(deps).execute(ctx.userId, id)
      return NextResponse.json({ user })
    }
    if (body.status === 'inactive') {
      const user = await new DeactivateUserUseCase(deps).execute(ctx.userId, id)
      return NextResponse.json({ user })
    }
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'status deve ser "active" ou "inactive"' } },
      { status: 422 }
    )
  } catch (error) {
    return handleError(error)
  }
}
