// Path: apps/api/src/routes/settings.ts
// Rotas de settings (site-gate) em Fastify — porte de
// apps/web/src/app/api/settings/site-gate/route.ts (strangler, ADR-007).
// GET é PÚBLICO: o proxy do web roda para tráfego anônimo e precisa ler o modo
// (não é dado sensível — qualquer visitante já vê /em-breve). PATCH exige
// administrator e responde 403 sem permissão. mode inválido → 422
// VALIDATION_ERROR pelo handler global (AppError).
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { ForbiddenError, ValidationError } from '@digimon/contracts'
import { requireRole, verifyJwt } from '@digimon/auth'
import { authDeps } from '../container'
import { readAccessToken } from '../http/cookies'
import { getSiteGate, isSiteGateMode, setSiteGate } from '../http/site-gate'

/** Sessão válida com papel administrator; qualquer outro caso → false. */
function isAdministrator(request: FastifyRequest): boolean {
  const token = readAccessToken(request)
  if (!token) return false
  try {
    const context = verifyJwt(authDeps().tokens, token)
    requireRole(context, 'administrator')
    return true
  } catch {
    return false
  }
}

export const settingsRoutes: FastifyPluginAsync = async (app) => {
  // GET /settings/site-gate → { mode: 'live' | 'coming-soon' } (público)
  app.get('/settings/site-gate', async (_request, reply) => {
    const mode = await getSiteGate()
    return reply.send({ mode })
  })

  // PATCH /settings/site-gate { mode } → atualiza o modo (somente administrator)
  app.patch('/settings/site-gate', async (request, reply) => {
    if (!isAdministrator(request)) throw new ForbiddenError('Sem permissão para esta ação')

    const body = (request.body ?? {}) as { mode?: unknown }
    if (!isSiteGateMode(body.mode)) {
      throw new ValidationError('mode deve ser "live" ou "coming-soon"')
    }

    await setSiteGate(body.mode)
    return reply.send({ mode: body.mode })
  })
}
