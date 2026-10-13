// packages/modules/comments/src/use-cases/list-my-comments/list-my-comments.ts
// Comentários do próprio autor (perfil do titular). Exige conta logada; por padrão
// lista apenas os comentários visíveis do titular, paginado.

import type { CommentStatus, PaginatedResult } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import type { CommentActor } from '../../domain/actor'
import type {
  CommentRepository,
  CommentWithAuthor,
  ListByAuthorParams
} from '../../domain/repositories/comment-repository'

export interface ListMyCommentsInput {
  actor: CommentActor | null
  page?: number
  pageSize?: number
  status?: CommentStatus
}

export class ListMyCommentsUseCase {
  constructor(private readonly repo: CommentRepository) {}

  async execute(input: ListMyCommentsInput): Promise<PaginatedResult<CommentWithAuthor>> {
    if (!input.actor) throw new UnauthorizedError('Listagem de comentários exige conta logada')

    const params: ListByAuthorParams = {
      authorId: input.actor.userId,
      status: input.status ?? 'visible'
    }
    if (input.page !== undefined) params.page = input.page
    if (input.pageSize !== undefined) params.pageSize = input.pageSize
    return this.repo.listByAuthor(params)
  }
}
