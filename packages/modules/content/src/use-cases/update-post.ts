// Path: packages/modules/content/src/use-cases/update-post.ts
// Edita rascunho/publicado. Autor do post OU Admin/Editor. Archived não é editável.
import type { EventBus } from '@digimon/contracts'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@digimon/contracts'
import { isEditorial, type Actor } from '../domain/actor'
import type { UpdatePostData } from '../domain/entities/post'
import { postEvent } from '../domain/events/post-events'
import type { PostRepository } from '../domain/repositories/post-repository'
import { updatePostSchema, type UpdatePostInput } from './schemas'

export interface UpdatePostCommand {
  actor: Actor
  id: string
  input: UpdatePostInput
}

export class UpdatePostUseCase {
  constructor(
    private readonly repo: PostRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdatePostCommand): Promise<{ id: string; slug: string }> {
    const parsed = updatePostSchema.safeParse(command.input)
    if (!parsed.success) throw new ValidationError('Dados inválidos do post', parsed.error.flatten())

    const post = await this.repo.findById(command.id)
    if (!post) throw new NotFoundError('Post não encontrado')

    if (post.authorId !== command.actor.id && !isEditorial(command.actor)) {
      throw new ForbiddenError('Somente o autor ou Admin/Editor podem editar este post')
    }

    if (parsed.data.slug !== undefined && parsed.data.slug !== post.slug) {
      const clash = await this.repo.findBySlug(parsed.data.slug)
      if (clash && clash.id !== post.id) {
        throw new ConflictError(`Já existe um post com o slug "${parsed.data.slug}"`)
      }
    }

    const patch: UpdatePostData = {}
    if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug
    if (parsed.data.title !== undefined) patch.title = parsed.data.title
    if (parsed.data.excerpt !== undefined) patch.excerpt = parsed.data.excerpt
    if (parsed.data.body !== undefined) patch.body = parsed.data.body
    if (parsed.data.coverImage !== undefined) patch.coverImage = parsed.data.coverImage
    if (parsed.data.externalUrl !== undefined) patch.externalUrl = parsed.data.externalUrl
    if (parsed.data.category !== undefined) patch.category = parsed.data.category

    post.update(patch)
    await this.repo.update(post)
    await this.eventBus.publish(postEvent('post.updated', post))

    return { id: post.id, slug: post.slug }
  }
}
