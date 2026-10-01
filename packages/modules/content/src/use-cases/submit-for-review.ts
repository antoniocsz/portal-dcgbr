// Path: packages/modules/content/src/use-cases/submit-for-review.ts
// draft → review. O autor submete o próprio rascunho; Admin/Editor também podem.
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import { isEditorial, type Actor } from '../domain/actor'
import { postEvent } from '../domain/events/post-events'
import type { PostRepository } from '../domain/repositories/post-repository'

export interface SubmitForReviewCommand {
  actor: Actor
  id: string
}

export class SubmitForReviewUseCase {
  constructor(
    private readonly repo: PostRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitForReviewCommand): Promise<{ id: string; status: 'review' }> {
    const post = await this.repo.findById(command.id)
    if (!post) throw new NotFoundError('Post não encontrado')

    if (post.authorId !== command.actor.id && !isEditorial(command.actor)) {
      throw new ForbiddenError('Somente o autor ou Admin/Editor podem submeter este post')
    }

    post.submitForReview()
    await this.repo.update(post)
    await this.eventBus.publish(postEvent('post.updated', post))

    return { id: post.id, status: 'review' }
  }
}
