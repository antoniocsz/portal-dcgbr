// packages/modules/comments/src/use-cases/list-comments/list-comments.ts
// Listagem pública de comentários por target, paginada. Expõe apenas visíveis.

import type { CommentStatus, CommentTargetType, PaginatedResult } from '@digimon/contracts'
import type { Comment } from '../../domain/entities/comment'
import type { CommentRepository, ListCommentsParams } from '../../domain/repositories/comment-repository'

export interface ListCommentsInput {
  targetType: CommentTargetType
  targetId: string
  page?: number
  pageSize?: number
  status?: CommentStatus
}

export class ListCommentsUseCase {
  constructor(private readonly repo: CommentRepository) {}

  async execute(input: ListCommentsInput): Promise<PaginatedResult<Comment>> {
    const params: ListCommentsParams = {
      targetType: input.targetType,
      targetId: input.targetId
    }
    if (input.page !== undefined) params.page = input.page
    if (input.pageSize !== undefined) params.pageSize = input.pageSize
    if (input.status !== undefined) params.status = input.status
    return this.repo.listByTarget(params)
  }
}
