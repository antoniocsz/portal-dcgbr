// Path: apps/api/src/routes/users.ts
// Rotas de usuários em Fastify — porte dos route handlers de
// apps/web/src/app/api/users/** (strangler, ADR-007). Contratos JSON idênticos;
// erros via AppError (handler global). Sessão via hooks authenticate/requireRoleHook.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { AuthContext } from '@digimon/auth'
import {
  ActivateUserUseCase,
  AssignRoleUseCase,
  DeactivateUserUseCase,
  DeleteUserAccountUseCase,
  ExportUserDataUseCase,
  GetProfileUseCase,
  ListUsersUseCase,
  UpdateProfileUseCase
} from '@digimon/users'
import { usersDeps } from '../container'
import { clearSessionCookies } from '../http/cookies'
import { authenticate, getAuthContext, requireRoleHook } from '../plugins/auth'
import { revokeSession } from '../session-revocation'

/** Contexto da sessão: `authenticate` injeta request.auth; fallback lê o token. */
function authContext(request: FastifyRequest): AuthContext {
  return request.auth ?? getAuthContext(request)
}

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /users — listagem (painel admin) com filtros; somente administrator.
  app.get(
    '/users',
    { preHandler: [authenticate, requireRoleHook('administrator')] },
    async (request, reply) => {
      const actorId = authContext(request).userId
      const result = await new ListUsersUseCase(usersDeps()).execute(actorId, request.query)
      return reply.send(result)
    }
  )

  // GET /users/me — perfil do usuário logado.
  app.get('/users/me', { preHandler: authenticate }, async (request, reply) => {
    const actorId = authContext(request).userId
    const user = await new GetProfileUseCase(usersDeps()).execute(actorId)
    return reply.send({ user })
  })

  // PATCH /users/me — atualiza nome/avatar do próprio perfil.
  app.patch('/users/me', { preHandler: authenticate }, async (request, reply) => {
    const actorId = authContext(request).userId
    const user = await new UpdateProfileUseCase(usersDeps()).execute(actorId, request.body)
    return reply.send({ user })
  })

  // GET /users/me/export — LGPD art. 18 (portabilidade): dados do titular em JSON.
  app.get('/users/me/export', { preHandler: authenticate }, async (request, reply) => {
    const actorId = authContext(request).userId
    const data = await new ExportUserDataUseCase(usersDeps()).execute(actorId)
    return reply.send(data)
  })

  // DELETE /users/me — LGPD art. 18 (eliminação): anonimiza + desativa o titular,
  // revoga as sessões (refresh + access) e limpa os cookies. 204 sem corpo.
  app.delete('/users/me', { preHandler: authenticate }, async (request, reply) => {
    const actorId = authContext(request).userId
    await new DeleteUserAccountUseCase(usersDeps()).execute(actorId)
    revokeSession(actorId)
    clearSessionCookies(reply)
    return reply.status(204).send()
  })

  // PATCH /users/:id/role — atribui papel; somente administrator.
  app.patch<{ Params: { id: string } }>(
    '/users/:id/role',
    { preHandler: [authenticate, requireRoleHook('administrator')] },
    async (request, reply) => {
      const actorId = authContext(request).userId
      const user = await new AssignRoleUseCase(usersDeps()).execute(
        actorId,
        request.params.id,
        request.body
      )
      return reply.send({ user })
    }
  )

  // PATCH /users/:id/status — ativa/desativa conta; somente administrator.
  app.patch<{ Params: { id: string } }>(
    '/users/:id/status',
    { preHandler: [authenticate, requireRoleHook('administrator')] },
    async (request, reply) => {
      const body = request.body as { status?: string }
      const deps = usersDeps()
      const actorId = authContext(request).userId

      if (body.status === 'active') {
        const user = await new ActivateUserUseCase(deps).execute(actorId, request.params.id)
        return reply.send({ user })
      }
      if (body.status === 'inactive') {
        const user = await new DeactivateUserUseCase(deps).execute(actorId, request.params.id)
        return reply.send({ user })
      }
      return reply.status(422).send({
        error: { code: 'VALIDATION_ERROR', message: 'status deve ser "active" ou "inactive"' }
      })
    }
  )
}
