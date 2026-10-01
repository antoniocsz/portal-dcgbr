// packages/modules/comments/src/use-cases/create-comment/create-comment.ts
// Cria um comentário em post/card/deck. Exige conta logada — anônimo não comenta.

import type { CommentTargetType } from '@digimon/contracts'
import { EventBus, UnauthorizedError } from '@digimon/contracts'
import { Comment } from '../../domain/entities/comment'
import { CommentCreatedEvent } from '../../domain/events/comment-events'
import type { CommentRepository } from '../../domain/repositories/comment-repository'
import type { CommentActor } from '../../domain/actor'

export interface CreateCommentInput {
  actor: CommentActor | null
  targetType: CommentTargetType
  targetId: string
  body: string
}

export class CreateCommentUseCase {
  constructor(
    private readonly repo: CommentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: CreateCommentInput): Promise<Comment> {
    if (!input.actor) throw new UnauthorizedError('Comentário exige conta logada')

    const comment = Comment.create({
      authorId: input.actor.userId,
      targetType: input.targetType,
      targetId: input.targetId,
      body: input.body
    })

    await this.repo.create(comment)
    await this.eventBus.publish(
      new CommentCreatedEvent({
        commentId: comment.id,
        authorId: comment.authorId,
        targetType: comment.targetType,
        targetId: comment.targetId
      })
    )
    return comment
  }
}
