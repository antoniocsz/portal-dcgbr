// packages/modules/comments/src/use-cases/delete-comment/delete-comment.ts
// Autor remove o próprio comentário; Admin/Editor removem qualquer um.
// Remove é soft-delete (status deleted) — histórico preservado.

import { ForbiddenError, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import { CommentDeletedEvent } from '../../domain/events/comment-events'
import type { CommentRepository } from '../../domain/repositories/comment-repository'
import type { CommentActor } from '../../domain/actor'
import { canModerate } from '../../domain/actor'
import type { EventBus } from '@digimon/contracts'

export interface DeleteCommentInput {
  actor: CommentActor | null
  commentId: string
}

export class DeleteCommentUseCase {
  constructor(
    private readonly repo: CommentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: DeleteCommentInput): Promise<void> {
    if (!input.actor) throw new UnauthorizedError('Comentário exige conta logada')

    const comment = await this.repo.findById(input.commentId)
    if (!comment) throw new NotFoundError('Comentário não encontrado')

    if (!comment.isOwnedBy(input.actor.userId) && !canModerate(input.actor)) {
      throw new ForbiddenError('Só o autor pode remover o próprio comentário')
    }

    comment.softDelete()
    await this.repo.update(comment)
    await this.eventBus.publish(
      new CommentDeletedEvent({
        commentId: comment.id,
        authorId: comment.authorId,
        targetType: comment.targetType,
        targetId: comment.targetId
      })
    )
  }
}
