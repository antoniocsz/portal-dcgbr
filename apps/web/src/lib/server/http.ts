// Path: apps/web/src/lib/server/http.ts
// Helpers para route handlers: resposta de erro uniforme (AppError → HTTP),
// cookies httpOnly de sessão e rate limit para endpoints sensíveis.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AppError } from '@digimon/contracts'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@digimon/auth'
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from '@digimon/auth'
import { InMemoryRateLimiter } from '@digimon/auth'

export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: (error as { details?: unknown }).details
        }
      },
      { status: error.statusCode }
    )
  }
  console.error('Erro não mapeado no route handler:', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
    { status: 500 }
  )
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

// Rate limit: registro de conta — 5 req/15min por IP (spec da task).
const registerLimiter = new InMemoryRateLimiter(5, 15 * 60 * 1000)

export function registerAllowed(request: NextRequest): boolean {
  return registerLimiter.allow(clientIp(request))
}

/** Anexa os cookies httpOnly de sessão à resposta (access curto + refresh 7d). */
export function attachSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  const secure = process.env.NODE_ENV === 'production'
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    sameSite: 'lax',
    secure
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    path: '/',
    maxAge: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
    sameSite: 'lax',
    secure
  })
  return response
}

export function clearSessionCookies(): NextResponse {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  return response
}

export function readRefreshToken(request: NextRequest): string | null {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value ?? null
}

export function readAccessToken(request: NextRequest): string | null {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}
