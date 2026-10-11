// Path: apps/api/src/plugins/rate-limit.ts
// Rate limit por IP para endpoints sensíveis (registro de conta etc.),
// reusando InMemoryRateLimiter do @digimon/auth (ADR-005: sem Redis na v1).
// Porte de apps/web/src/lib/server/http.ts (clientIp + registerLimiter).
import type { FastifyRequest, preHandlerHookHandler } from 'fastify'
import { InMemoryRateLimiter } from '@digimon/auth'
import { AppError } from '@digimon/contracts'

/** IP do cliente (proxy-first, como no web): x-forwarded-for → x-real-ip → socket. */
export function clientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? request.ip
  }
  const realIp = request.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) return realIp
  return request.ip
}

/** Cria um preHandler que limita `max` requisições por IP em `windowMs` (429 ao estourar). */
export function createRateLimitHook(max: number, windowMs: number): preHandlerHookHandler {
  const limiter = new InMemoryRateLimiter(max, windowMs)
  return async (request) => {
    if (!limiter.allow(clientIp(request))) {
      throw new AppError('Muitas tentativas. Tente novamente em 15 minutos.', 429, 'RATE_LIMITED')
    }
  }
}

/** Registro de conta: 5 req/15min por IP (spec original preservada). */
export const registerRateLimit: preHandlerHookHandler = createRateLimitHook(5, 15 * 60 * 1000)
