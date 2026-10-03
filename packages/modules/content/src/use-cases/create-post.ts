// Path: packages/modules/content/src/use-cases/create-post.ts
// Cria rascunho (draft). Qualquer usuário autenticado pode criar; a publicação
// final exige Admin/Editor (workflow draft → review → published).
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ConflictError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Post, slugify } from '../domain/entities/post'
import { postEvent } from '../domain/events/post-events'
import type { PostRepository } from '../domain/repositories/post-repository'
import { createPostSchema, type CreatePostInput } from './schemas'

export interface CreatePostCommand {
  actor: Actor
  input: CreatePostInput
}

export class CreatePostUseCase {
  constructor(
    private readonly repo: PostRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreatePostCommand): Promise<{ id: string; slug: string }> {
    const parsed = createPostSchema.safeParse(command.input)
    if (!parsed.success) throw new ValidationError('Dados inválidos do post', parsed.error.flatten())

    const { title, category } = parsed.data
    const slug = parsed.data.slug ?? slugify(title)

    const existing = await this.repo.findBySlug(slug)
    if (existing) throw new ConflictError(`Já existe um post com o slug "${slug}"`)

    const post = Post.create({
      id: randomUUID(),
      slug,
      title,
      excerpt: parsed.data.excerpt ?? null,
      body: parsed.data.body,
      coverImage: parsed.data.coverImage ?? null,
      externalUrl: parsed.data.externalUrl ?? null,
      category,
      authorId: command.actor.id
    })

    await this.repo.create(post.data)
    await this.eventBus.publish(postEvent('post.created', post))

    return { id: post.id, slug: post.slug }
  }
}
