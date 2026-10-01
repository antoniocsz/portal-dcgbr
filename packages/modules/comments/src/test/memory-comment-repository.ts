// packages/modules/comments/src/test/memory-comment-repository.ts
// Repositório em memória para testes unitários (L — substituto intercambiável do Prisma).

import type { PaginatedResult } from '@digimon/contracts'
import type { Comment } from '../domain/entities/comment'
import type {
  CommentRepository,
  CommentWithAuthor,
  ListAllCommentsParams,
  ListCommentsParams
} from '../domain/repositories/comment-repository'

interface Entry {
  comment: Comment
  seq: number
}

export class MemoryCommentRepository implements CommentRepository {
  private readonly items = new Map<string, Entry>()
  private seq = 0

  async create(comment: Comment): Promise<Comment> {
    this.items.set(comment.id, { comment, seq: this.seq++ })
    return comment
  }

  async findById(id: string): Promise<Comment | null> {
    return this.items.get(id)?.comment ?? null
  }

  async update(comment: Comment): Promise<Comment> {
    const existing = this.items.get(comment.id)
    this.items.set(comment.id, { comment, seq: existing?.seq ?? this.seq++ })
    return comment
  }

  async listByTarget(params: ListCommentsParams): Promise<PaginatedResult<Comment>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
    const matching = [...this.items.values()].filter(
      (entry) => entry.comment.targetType === params.targetType
        && entry.comment.targetId === params.targetId
        && (params.status
          ? entry.comment.status === params.status
          : entry.comment.status === 'visible')
    )
    matching.sort((a, b) => {
      const byDate = b.comment.createdAt.getTime() - a.comment.createdAt.getTime()
      return byDate !== 0 ? byDate : b.seq - a.seq
    })
    const items = matching
      .slice((page - 1) * pageSize, page * pageSize)
      .map((entry) => entry.comment)
    return { items, total: matching.length, page, pageSize }
  }

  async listAll(params: ListAllCommentsParams): Promise<PaginatedResult<CommentWithAuthor>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
    const matching = [...this.items.values()].filter(
      (entry) =>
        (params.status ? entry.comment.status === params.status : true)
        && (params.targetType ? entry.comment.targetType === params.targetType : true)
    )
    matching.sort((a, b) => {
      const byDate = b.comment.createdAt.getTime() - a.comment.createdAt.getTime()
      return byDate !== 0 ? byDate : b.seq - a.seq
    })
    const items = matching
      .slice((page - 1) * pageSize, page * pageSize)
      .map((entry) => ({ comment: entry.comment, authorName: 'Autor' }))
    return { items, total: matching.length, page, pageSize }
  }
}
