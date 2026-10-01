// Path: apps/web/src/app/api/auth/reset-password/route.ts
// Valida token single-use (TTL 15min), troca a senha e revoga refresh tokens.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ResetPasswordUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { handleError } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const deps = authDeps()
    await new ResetPasswordUseCase(deps).execute(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleError(error)
  }
}
