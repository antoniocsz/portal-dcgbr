// packages/modules/comments/src/domain/repositories/comment-repository.ts
// Interface do repositório — dependência invertida (DIP). Implementação em infra/.

import type { CommentStatus, CommentTargetType, PaginatedResult } from '@digimon/contracts'
import type { Comment } from '../entities/comment'

export interface ListCommentsParams {
  targetType: CommentTargetType
  targetId: string
  page?: number
  pageSize?: number
  status?: CommentStatus
}

export interface ListAllCommentsParams {
  page?: number
  pageSize?: number
  status?: CommentStatus
  targetType?: CommentTargetType
}

/** Comentário com metadados do autor (nome) para listagens administrativas. */
export interface CommentWithAuthor {
  comment: Comment
  authorName: string
}

export interface CommentRepository {
  create(comment: Comment): Promise<Comment>
  findById(id: string): Promise<Comment | null>
  update(comment: Comment): Promise<Comment>
  listByTarget(params: ListCommentsParams): Promise<PaginatedResult<Comment>>
  /** Listagem global (admin): qualquer status, com nome do autor. */
  listAll(params: ListAllCommentsParams): Promise<PaginatedResult<CommentWithAuthor>>
}
