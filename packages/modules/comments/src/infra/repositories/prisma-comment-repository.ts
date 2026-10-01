// packages/modules/comments/src/infra/repositories/prisma-comment-repository.ts
// Implementação Prisma da CommentRepository. Mapeia enums do domínio (lower-case)
// para os enums do schema (UPPER_CASE).

import type { CommentStatus, CommentTargetType, PaginatedResult } from '@digimon/contracts'
import type { Prisma } from '@digimon/database'
import { CommentStatus as PrismaCommentStatus, CommentTargetType as PrismaCommentTargetType, PrismaClient } from '@digimon/database'
import type { Comment } from '../../domain/entities/comment'
import { Comment as CommentEntity } from '../../domain/entities/comment'
import type {
  CommentRepository,
  CommentWithAuthor,
  ListAllCommentsParams,
  ListCommentsParams
} from '../../domain/repositories/comment-repository'

const STATUS_MAP: Record<CommentStatus, PrismaCommentStatus> = {
  visible: 'VISIBLE',
  hidden: 'HIDDEN',
  deleted: 'DELETED'
}

const TARGET_TYPE_MAP: Record<CommentTargetType, PrismaCommentTargetType> = {
  post: 'POST',
  card: 'CARD',
  deck: 'DECK'
}

type CommentRow = Prisma.CommentGetPayload<object>

export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(comment: Comment): Promise<Comment> {
    const row = await this.db.comment.create({
      data: {
        id: comment.id,
        authorId: comment.authorId,
        targetType: TARGET_TYPE_MAP[comment.targetType],
        targetId: comment.targetId,
        body: comment.body,
        status: STATUS_MAP[comment.status]
      }
    })
    return this.toEntity(row)
  }

  async findById(id: string): Promise<Comment | null> {
    const row = await this.db.comment.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async update(comment: Comment): Promise<Comment> {
    const row = await this.db.comment.update({
      where: { id: comment.id },
      data: {
        body: comment.body,
        status: STATUS_MAP[comment.status]
      }
    })
    return this.toEntity(row)
  }

  async listByTarget(params: ListCommentsParams): Promise<PaginatedResult<Comment>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
    const where: Prisma.CommentWhereInput = {
      targetType: TARGET_TYPE_MAP[params.targetType],
      targetId: params.targetId,
      status: params.status ? STATUS_MAP[params.status] : 'VISIBLE'
    }
    const [rows, total] = await Promise.all([
      this.db.comment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.comment.count({ where })
    ])
    return {
      items: rows.map((row) => this.toEntity(row)),
      total,
      page,
      pageSize
    }
  }

  async listAll(params: ListAllCommentsParams): Promise<PaginatedResult<CommentWithAuthor>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20))
    const where: Prisma.CommentWhereInput = {}
    if (params.status) where.status = STATUS_MAP[params.status]
    if (params.targetType) where.targetType = TARGET_TYPE_MAP[params.targetType]

    const [rows, total] = await Promise.all([
      this.db.comment.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.comment.count({ where })
    ])
    return {
      items: rows.map((row) => ({
        comment: this.toEntity(row),
        authorName: row.author?.name ?? 'Autor removido'
      })),
      total,
      page,
      pageSize
    }
  }

  private toEntity(row: CommentRow): Comment {
    return CommentEntity.from({
      id: row.id,
      authorId: row.authorId,
      targetType: this.toTargetType(row.targetType),
      targetId: row.targetId,
      body: row.body,
      status: this.toStatus(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    })
  }

  private toStatus(status: PrismaCommentStatus): CommentStatus {
    switch (status) {
      case 'HIDDEN': return 'hidden'
      case 'DELETED': return 'deleted'
      default: return 'visible'
    }
  }

  private toTargetType(targetType: PrismaCommentTargetType): CommentTargetType {
    switch (targetType) {
      case 'CARD': return 'card'
      case 'DECK': return 'deck'
      default: return 'post'
    }
  }
}
