// packages/modules/comments/src/use-cases/update-comment/update-comment.ts
// Autor edita o próprio comentário. Não pode editar comentário de outro.

import { ForbiddenError, NotFoundError, UnauthorizedError } from '@digimon/contracts'
import type { Comment } from '../../domain/entities/comment'
import type { CommentRepository } from '../../domain/repositories/comment-repository'
import type { CommentActor } from '../../domain/actor'

export interface UpdateCommentInput {
  actor: CommentActor | null
  commentId: string
  body: string
}

export class UpdateCommentUseCase {
  constructor(private readonly repo: CommentRepository) {}

  async execute(input: UpdateCommentInput): Promise<Comment> {
    if (!input.actor) throw new UnauthorizedError('Comentário exige conta logada')

    const comment = await this.repo.findById(input.commentId)
    if (!comment) throw new NotFoundError('Comentário não encontrado')
    if (!comment.isOwnedBy(input.actor.userId)) {
      throw new ForbiddenError('Só o autor pode editar o próprio comentário')
    }

    comment.edit(input.body)
    return this.repo.update(comment)
  }
}
