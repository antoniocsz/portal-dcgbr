// Path: apps/api/src/routes/comments.ts
// Rotas de comentários em Fastify — porte dos route handlers de
// apps/web/src/app/api/comments/** (strangler, ADR-007). Contratos JSON idênticos
// (inclui authorName e moderação admin|editor); erros via AppError (handler global).
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { CommentActor, CommentWithAuthor } from '@digimon/comments'
import { ValidationError, UnauthorizedError } from '@digimon/contracts'
import type { CommentStatus, CommentTargetType } from '@digimon/contracts'
import { verifyJwt } from '@digimon/auth'
import { authDeps, commentsDeps } from '../container'
import { readSessionToken } from '../plugins/auth'

/**
 * Ator autenticado da requisição (cookie httpOnly ou Bearer). Sem token → null
 * (anônimo); token inválido/expirado → UnauthorizedError (401).
 */
function getSessionUser(request: FastifyRequest): CommentActor | null {
  const token = readSessionToken(request)
  if (!token) return null
  return verifyJwt(authDeps().tokens, token)
}

function parseCommentTargetType(value: string | undefined): CommentTargetType | null {
  if (value === 'post' || value === 'card' || value === 'deck') return value
  return null
}

function parsePage(value: string | undefined): number {
  const page = Number(value ?? 1)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function parsePageSize(value: string | undefined): number {
  const pageSize = Number(value ?? 20)
  return Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20
}

function serializeComment({ comment, authorName }: CommentWithAuthor) {
  return {
    id: comment.id,
    authorId: comment.authorId,
    authorName,
    targetType: comment.targetType,
    targetId: comment.targetId,
    body: comment.body,
    status: comment.status,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString()
  }
}

interface ListQuery {
  targetType?: string
  targetId?: string
  page?: string
  pageSize?: string
}

interface AdminListQuery {
  status?: string
  targetType?: string
  page?: string
  pageSize?: string
}

interface IdParams {
  id: string
}

export const commentsRoutes: FastifyPluginAsync = async (app) => {
  // GET /comments — listagem pública por target (paginada, apenas visíveis).
  app.get<{ Querystring: ListQuery }>('/comments', async (request, reply) => {
    const { targetType: rawTargetType, targetId, page, pageSize } = request.query
    const targetType = parseCommentTargetType(rawTargetType)
    if (!targetType) throw new ValidationError('targetType inválido: use post, card ou deck')
    if (!targetId) throw new ValidationError('targetId é obrigatório')

    const result = await commentsDeps().list.execute({
      targetType,
      targetId,
      page: parsePage(page),
      pageSize: parsePageSize(pageSize)
    })
    return reply.send({
      items: result.items.map(serializeComment),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    })
  })

  // POST /comments — cria comentário (exige conta logada).
  app.post<{ Body: { targetType?: unknown; targetId?: unknown; body?: unknown } }>(
    '/comments',
    async (request, reply) => {
      const actor = getSessionUser(request)
      const body = request.body ?? {}
      const targetType = parseCommentTargetType(
        typeof body.targetType === 'string' ? body.targetType : undefined
      )
      if (!targetType) throw new ValidationError('targetType inválido: use post, card ou deck')

      const comment = await commentsDeps().create.execute({
        actor,
        targetType,
        targetId: typeof body.targetId === 'string' ? body.targetId : '',
        body: typeof body.body === 'string' ? body.body : ''
      })
      return reply.status(201).send({ comment })
    }
  )

  // GET /comments/admin — listagem global para moderação (Admin/Editor), com authorName.
  app.get<{ Querystring: AdminListQuery }>('/comments/admin', async (request, reply) => {
    const actor = getSessionUser(request)
    if (!actor) throw new UnauthorizedError('Não autenticado')

    const { status, targetType: rawTargetType, page, pageSize } = request.query
    const input: {
      actor: CommentActor
      status?: CommentStatus
      targetType?: CommentTargetType
      page: number
      pageSize: number
    } = {
      actor,
      page: parsePage(page),
      pageSize: parsePageSize(pageSize)
    }
    if (status === 'visible' || status === 'hidden' || status === 'deleted') input.status = status
    const targetType = parseCommentTargetType(rawTargetType)
    if (targetType) input.targetType = targetType

    const result = await commentsDeps().listAll.execute(input)
    return reply.send({
      items: result.items.map(serializeComment),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    })
  })

  // PATCH /comments/:id — autor edita o próprio comentário.
  app.patch<{ Params: IdParams; Body: { body?: unknown } }>('/comments/:id', async (request, reply) => {
    const actor = getSessionUser(request)
    const { id } = request.params
    const body = request.body ?? {}
    const comment = await commentsDeps().update.execute({
      actor,
      commentId: id,
      body: typeof body.body === 'string' ? body.body : ''
    })
    return reply.send({ comment })
  })

  // DELETE /comments/:id — autor remove o próprio; Admin/Editor removem qualquer (soft-delete).
  app.delete<{ Params: IdParams }>('/comments/:id', async (request, reply) => {
    const actor = getSessionUser(request)
    await commentsDeps().delete.execute({ actor, commentId: request.params.id })
    return reply.status(204).send()
  })

  // POST /comments/:id/moderate — Admin/Editor ocultam (hidden) ou exibem comentário.
  app.post<{ Params: IdParams; Body: { action?: unknown } }>(
    '/comments/:id/moderate',
    async (request, reply) => {
      const actor = getSessionUser(request)
      const { id } = request.params
      const body = request.body ?? {}
      if (body.action !== 'hide' && body.action !== 'show') {
        throw new ValidationError('action inválida: use hide ou show')
      }
      const comment = await commentsDeps().moderate.execute({
        actor,
        commentId: id,
        action: body.action
      })
      return reply.send({ comment })
    }
  )
}
