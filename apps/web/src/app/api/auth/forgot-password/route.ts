// Path: apps/web/src/app/api/auth/forgot-password/route.ts
// Resposta genérica — nunca revela se o email existe.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ForgotPasswordUseCase } from '@digimon/auth'
import { authDeps } from '@/lib/server/container'
import { handleError } from '@/lib/server/http'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const deps = authDeps()
    await new ForgotPasswordUseCase(deps).execute(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleError(error)
  }
}
