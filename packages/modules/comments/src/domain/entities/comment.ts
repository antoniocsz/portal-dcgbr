// packages/modules/comments/src/domain/entities/comment.ts
// Entidade Comment — agregado puro do domínio, sem infraestrutura.

import type { CommentStatus, CommentTargetType } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'

export interface CommentProps {
  id: string
  authorId: string
  targetType: CommentTargetType
  targetId: string
  body: string
  status: CommentStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommentProps {
  id?: string
  authorId: string
  targetType: CommentTargetType
  targetId: string
  body: string
}

export const COMMENT_BODY_MAX_LENGTH = 2000

export class Comment {
  private constructor(
    public readonly id: string,
    public readonly authorId: string,
    public readonly targetType: CommentTargetType,
    public readonly targetId: string,
    private _body: string,
    private _status: CommentStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(props: CreateCommentProps): Comment {
    const body = props.body.trim()
    if (!body) throw new ValidationError('Comentário não pode ser vazio')
    if (body.length > COMMENT_BODY_MAX_LENGTH) {
      throw new ValidationError(`Comentário excede ${COMMENT_BODY_MAX_LENGTH} caracteres`)
    }
    const now = new Date()
    return new Comment(
      props.id ?? crypto.randomUUID(),
      props.authorId,
      props.targetType,
      props.targetId.trim(),
      body,
      'visible',
      now,
      now
    )
  }

  static from(props: CommentProps): Comment {
    return new Comment(
      props.id,
      props.authorId,
      props.targetType,
      props.targetId,
      props.body,
      props.status,
      props.createdAt,
      props.updatedAt
    )
  }

  get body(): string {
    return this._body
  }

  get status(): CommentStatus {
    return this._status
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  isOwnedBy(userId: string): boolean {
    return this.authorId === userId
  }

  edit(newBody: string): void {
    if (this._status === 'deleted') throw new ValidationError('Comentário removido não pode ser editado')
    const body = newBody.trim()
    if (!body) throw new ValidationError('Comentário não pode ser vazio')
    if (body.length > COMMENT_BODY_MAX_LENGTH) {
      throw new ValidationError(`Comentário excede ${COMMENT_BODY_MAX_LENGTH} caracteres`)
    }
    this._body = body
    this._updatedAt = new Date()
  }

  hide(): void {
    if (this._status === 'deleted') throw new ValidationError('Comentário removido não pode ser moderado')
    this._status = 'hidden'
    this._updatedAt = new Date()
  }

  show(): void {
    if (this._status === 'deleted') throw new ValidationError('Comentário removido não pode ser moderado')
    this._status = 'visible'
    this._updatedAt = new Date()
  }

  softDelete(): void {
    if (this._status === 'deleted') return
    this._status = 'deleted'
    this._updatedAt = new Date()
  }
}
