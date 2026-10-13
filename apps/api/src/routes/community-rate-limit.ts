// Path: apps/api/src/routes/community-rate-limit.ts
// Token bucket em memória por CONTA para os endpoints de engajamento da
// comunidade (like / publicar). Complementa o rate limit por IP de
// plugins/rate-limit.ts: aqui a chave é o usuário autenticado. Sem Redis na v1
// (ADR-005). Erros delegados ao handler global (AppError → 429 too_many_requests).
import type { FastifyRequest, preHandlerHookHandler } from 'fastify'
import { AppError } from '@digimon/contracts'
import { getAuthContext } from '../plugins/auth'

interface Bucket {
  tokens: number
  updatedAt: number
}

/**
 * preHandler: permite `capacity` ações com recarga contínua de `capacity`
 * tokens por `windowMs`. Roda DEPOIS de `authenticate` (usa `request.auth`).
 * Excedeu o balde → 429 `too_many_requests`.
 */
export function createAccountRateLimit(
  capacity: number,
  windowMs: number
): preHandlerHookHandler {
  const buckets = new Map<string, Bucket>()
  const refillPerMs = capacity / windowMs

  return async (request: FastifyRequest) => {
    const context = request.auth ?? getAuthContext(request)
    const now = Date.now()
    const bucket = buckets.get(context.userId) ?? { tokens: capacity, updatedAt: now }
    const tokens = Math.min(capacity, bucket.tokens + (now - bucket.updatedAt) * refillPerMs)

    if (tokens < 1) {
      buckets.set(context.userId, { tokens, updatedAt: now })
      throw new AppError('Muitas requisições. Tente novamente em instantes.', 429, 'too_many_requests')
    }

    buckets.set(context.userId, { tokens: tokens - 1, updatedAt: now })
  }
}

/** Like: 30 ações por 2s. */
export const likeRateLimit = createAccountRateLimit(30, 2_000)
/** Publicar/atualizar: 10 ações por 30s. */
export const publishRateLimit = createAccountRateLimit(10, 30_000)
