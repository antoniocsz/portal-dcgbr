// packages/modules/comments/src/use-cases/moderate-comment/moderate-comment.ts
// Admin/Editor moderam qualquer comentário: ocultam (status hidden) ou exibem.
// Moderação oculta sem apagar histórico.

import { ForbiddenError, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import type { EventBus } from '@digimon/contracts'
import type { Comment } from '../../domain/entities/comment'
import { CommentHiddenEvent } from '../../domain/events/comment-events'
import type { CommentRepository } from '../../domain/repositories/comment-repository'
import type { CommentActor } from '../../domain/actor'
import { canModerate } from '../../domain/actor'

export type ModerateAction = 'hide' | 'show'

export interface ModerateCommentInput {
  actor: CommentActor | null
  commentId: string
  action: ModerateAction
}

export class ModerateCommentUseCase {
  constructor(
    private readonly repo: CommentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: ModerateCommentInput): Promise<Comment> {
    if (!input.actor) throw new UnauthorizedError('Comentário exige conta logada')
    if (!canModerate(input.actor)) {
      throw new ForbiddenError('Apenas Admin/Editor podem moderar comentários')
    }

    const comment = await this.repo.findById(input.commentId)
    if (!comment) throw new NotFoundError('Comentário não encontrado')

    if (input.action === 'hide') {
      comment.hide()
      const updated = await this.repo.update(comment)
      await this.eventBus.publish(
        new CommentHiddenEvent({
          commentId: comment.id,
          authorId: comment.authorId,
          targetType: comment.targetType,
          targetId: comment.targetId
        })
      )
      return updated
    }

    comment.show()
    return this.repo.update(comment)
  }
}
