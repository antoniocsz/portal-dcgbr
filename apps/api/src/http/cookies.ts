// Path: apps/api/src/http/cookies.ts
// Helpers de cookie httpOnly de sessão para a API Fastify.
// Porte de apps/web/src/lib/server/http.ts (strangler, ADR-007).
// Topologia cross-origin (ADR-007, Opção A): cookie compartilhado entre
// `digimoncardgamebrasil.com.br` e `api.digimoncardgamebrasil.com.br` via
// `Domain`, com `SameSite=Lax` (subdomínios são same-site) e `Secure` em produção.
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_MS
} from '@digimon/auth'

type SameSite = 'Lax' | 'Strict' | 'None'

interface CookieOptions {
  httpOnly?: boolean
  path?: string
  maxAge?: number
  sameSite?: SameSite
  secure?: boolean
  domain?: string | undefined
}

function parseCookies(header: string | undefined): Record<string, string> {
  const jar: Record<string, string> = {}
  if (!header) return jar
  for (const part of header.split(';')) {
    const separator = part.indexOf('=')
    if (separator === -1) continue
    const name = part.slice(0, separator).trim()
    const rawValue = part.slice(separator + 1).trim()
    if (!name) continue
    try {
      jar[name] = decodeURIComponent(rawValue)
    } catch {
      jar[name] = rawValue
    }
  }
  return jar
}

function serializeCookie(name: string, value: string, options: CookieOptions): string {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path ?? '/'}`]
  if (options.httpOnly) parts.push('HttpOnly')
  if (options.secure) parts.push('Secure')
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
  if (options.domain) parts.push(`Domain=${options.domain}`)
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
  return parts.join('; ')
}

/**
 * Domínio compartilhado dos cookies de sessão (subdomínios same-site).
 * `COOKIE_DOMAIN` permite override; em produção o default cobre web + api;
 * sem override e fora de produção, o cookie sai sem `Domain` (dev/localhost).
 */
export function sessionCookieDomain(): string | undefined {
  const configured = process.env.COOKIE_DOMAIN?.trim()
  if (configured) return configured
  return process.env.NODE_ENV === 'production' ? '.digimoncardgamebrasil.com.br' : undefined
}

/** Lê um cookie da requisição pelo nome (URL-decoded). */
export function readCookie(request: FastifyRequest, name: string): string | null {
  return parseCookies(request.headers.cookie)[name] ?? null
}

export function readAccessToken(request: FastifyRequest): string | null {
  return readCookie(request, ACCESS_TOKEN_COOKIE)
}

export function readRefreshToken(request: FastifyRequest): string | null {
  return readCookie(request, REFRESH_TOKEN_COOKIE)
}

/** Anexa os cookies httpOnly de sessão à resposta (access curto + refresh 7d). */
export function attachSessionCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string
): FastifyReply {
  const secure = process.env.NODE_ENV === 'production'
  const domain = sessionCookieDomain()
  reply.header('Set-Cookie', [
    serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
      sameSite: 'Lax',
      secure,
      domain
    }),
    serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
      sameSite: 'Lax',
      secure,
      domain
    })
  ])
  return reply
}

/** Expira os cookies de sessão (logout). */
export function clearSessionCookies(reply: FastifyReply): FastifyReply {
  const domain = sessionCookieDomain()
  reply.header('Set-Cookie', [
    serializeCookie(ACCESS_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0, domain }),
    serializeCookie(REFRESH_TOKEN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0, domain })
  ])
  return reply
}
