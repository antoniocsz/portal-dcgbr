// Path: apps/web/src/app/api/settings/site-gate/route.ts
// GET  /api/settings/site-gate → { mode: 'live' | 'coming-soon' }
// PATCH /api/settings/site-gate { mode } → atualiza o modo (somente administrator)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, verifyJwt, requireRole } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { getSiteGate, isSiteGateMode, setSiteGate, type SiteGateMode } from '@/lib/server/site-gate'

export const runtime = 'nodejs'

function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } },
    { status: 401 }
  )
}

function forbidden(): NextResponse {
  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message: 'Sem permissão para esta ação' } },
    { status: 403 }
  )
}

async function currentAdmin(): Promise<{ userId: string } | null> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
  if (!token) return null
  try {
    const context = verifyJwt(authDeps().tokens, token)
    try {
      requireRole(context, 'administrator')
    } catch {
      return null
    }
    return { userId: context.userId }
  } catch {
    return null
  }
}

export async function GET(): Promise<NextResponse> {
  const admin = await currentAdmin()
  if (!admin) return unauthorized()
  const mode = await getSiteGate()
  return NextResponse.json({ mode })
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const admin = await currentAdmin()
  if (!admin) return forbidden()

  let body: { mode?: unknown }
  try {
    body = (await request.json()) as { mode?: unknown }
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Corpo inválido' } },
      { status: 422 }
    )
  }

  if (!isSiteGateMode(body.mode)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'mode deve ser "live" ou "coming-soon"' } },
      { status: 422 }
    )
  }

  await setSiteGate(body.mode as SiteGateMode)
  return NextResponse.json({ mode: body.mode })
}
