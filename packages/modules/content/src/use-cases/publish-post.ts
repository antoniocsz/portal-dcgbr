// Path: packages/modules/content/src/use-cases/publish-post.ts
// review → published. REGRA DE NEGÓCIO CENTRAL: somente Admin/Editor publicam.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireEditorial, type Actor } from '../domain/actor'
import { postEvent } from '../domain/events/post-events'
import type { PostRepository } from '../domain/repositories/post-repository'

export interface PublishPostCommand {
  actor: Actor
  id: string
}

export class PublishPostUseCase {
  constructor(
    private readonly repo: PostRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: PublishPostCommand): Promise<{ id: string; publishedAt: Date }> {
    requireEditorial(command.actor)

    const post = await this.repo.findById(command.id)
    if (!post) throw new NotFoundError('Post não encontrado')

    post.publish()
    await this.repo.update(post)
    await this.eventBus.publish(postEvent('post.published', post))

    return { id: post.id, publishedAt: post.data.publishedAt as Date }
  }
}
