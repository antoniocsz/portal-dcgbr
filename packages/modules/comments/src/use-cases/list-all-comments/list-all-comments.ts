// packages/modules/comments/src/use-cases/list-all-comments/list-all-comments.ts
// Listagem global de comentários para moderação (Admin/Editor). Qualquer
// status (visible/hidden/deleted), com nome do autor. Fronteira editorial:
// quem chama deve validar a role (aqui validamos no domínio via actor).

import type { CommentStatus, CommentTargetType, PaginatedResult } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'
import type { CommentActor } from '../../domain/actor'
import { canModerate } from '../../domain/actor'
import type { CommentWithAuthor } from '../../domain/repositories/comment-repository'
import type { CommentRepository } from '../../domain/repositories/comment-repository'

export interface ListAllCommentsInput {
  actor: CommentActor
  page?: number
  pageSize?: number
  status?: CommentStatus
  targetType?: CommentTargetType
}

export class ListAllCommentsUseCase {
  constructor(private readonly repo: CommentRepository) {}

  async execute(input: ListAllCommentsInput): Promise<PaginatedResult<CommentWithAuthor>> {
    if (!canModerate(input.actor)) {
      throw new ForbiddenError('Apenas moderadores podem listar todos os comentários')
    }
    const params: {
      page?: number
      pageSize?: number
      status?: CommentStatus
      targetType?: CommentTargetType
    } = {}
    if (input.page !== undefined) params.page = input.page
    if (input.pageSize !== undefined) params.pageSize = input.pageSize
    if (input.status !== undefined) params.status = input.status
    if (input.targetType !== undefined) params.targetType = input.targetType
    return this.repo.listAll(params)
  }
}
