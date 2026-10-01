// Path: packages/modules/content/src/use-cases/archive-post.ts
// published → archived. Somente Admin/Editor.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireEditorial, type Actor } from '../domain/actor'
import { postEvent } from '../domain/events/post-events'
import type { PostRepository } from '../domain/repositories/post-repository'

export interface ArchivePostCommand {
  actor: Actor
  id: string
}

export class ArchivePostUseCase {
  constructor(
    private readonly repo: PostRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ArchivePostCommand): Promise<{ id: string; status: 'archived' }> {
    requireEditorial(command.actor)

    const post = await this.repo.findById(command.id)
    if (!post) throw new NotFoundError('Post não encontrado')

    post.archive()
    await this.repo.update(post)
    await this.eventBus.publish(postEvent('post.archived', post))

    return { id: post.id, status: 'archived' }
  }
}
