// Path: packages/modules/content/src/use-cases/post-workflow.spec.ts
// Critérios: Author não publica direto (só via review → publicado por Admin/Editor);
// slug único (conflito rejeitado); transições de status válidas.
import { describe, expect, it } from 'vitest'
import type { PaginatedResult, Role } from '@digimon/contracts'
import { ConflictError, ForbiddenError, InMemoryEventBus, NotFoundError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Post, type PostData } from '../domain/entities/post'
import type { ListPostsParams, PostRepository } from '../domain/repositories/post-repository'
import { ArchivePostUseCase } from './archive-post'
import { CreatePostUseCase, type CreatePostCommand } from './create-post'
import { PublishPostUseCase } from './publish-post'
import { SubmitForReviewUseCase } from './submit-for-review'
import { UpdatePostUseCase } from './update-post'

class InMemoryPostRepository implements PostRepository {
  private readonly posts = new Map<string, Post>()

  async create(data: PostData): Promise<void> {
    this.posts.set(data.id, Post.fromData(data))
  }

  async update(post: Post): Promise<void> {
    this.posts.set(post.id, post)
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Post | null> {
    for (const post of this.posts.values()) {
      if (post.slug === slug) return post
    }
    return null
  }

  async list(params: ListPostsParams): Promise<PaginatedResult<Post>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const items = [...this.posts.values()].filter(
      (p) =>
        (params.category === undefined || p.category === params.category) &&
        (params.status === undefined || p.status === params.status)
    )
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }
}

function actor(role: Role, id = 'user-1'): Actor {
  return { id, role }
}

const member = actor('member')
const editor = actor('editor', 'user-2')
const admin = actor('administrator', 'user-3')

function setup() {
  const repo = new InMemoryPostRepository()
  const eventBus = new InMemoryEventBus()
  const events: string[] = []
  eventBus.subscribe('post.created', (e) => {
    events.push(e.type)
  })
  eventBus.subscribe('post.updated', (e) => {
    events.push(e.type)
  })
  eventBus.subscribe('post.published', (e) => {
    events.push(e.type)
  })
  eventBus.subscribe('post.archived', (e) => {
    events.push(e.type)
  })
  return {
    repo,
    eventBus,
    events,
    create: new CreatePostUseCase(repo, eventBus),
    update: new UpdatePostUseCase(repo, eventBus),
    submit: new SubmitForReviewUseCase(repo, eventBus),
    publish: new PublishPostUseCase(repo, eventBus),
    archive: new ArchivePostUseCase(repo, eventBus)
  }
}

function createCommand(overrides: Partial<CreatePostCommand['input']> = {}): CreatePostCommand {
  return {
    actor: member,
    input: {
      title: 'Alysium: simulador oficial do Digimon TCG em 2026',
      body: 'Conteúdo da notícia.',
      category: 'simulator',
      ...overrides
    }
  }
}

describe('CreatePostUseCase', () => {
  it('cria rascunho para qualquer usuário autenticado e publica post.created', async () => {
    const { create, repo, events } = setup()
    const result = await create.execute(createCommand())

    expect(result.slug).toBe('alysium-simulador-oficial-do-digimon-tcg-em-2026')
    const post = await repo.findById(result.id)
    expect(post?.status).toBe('draft')
    expect(post?.authorId).toBe(member.id)
    expect(events).toEqual(['post.created'])
  })

  it('rejeita slug duplicado com ConflictError', async () => {
    const { create } = setup()
    await create.execute(createCommand({ slug: 'alysium-2026' }))
    await expect(create.execute(createCommand({ slug: 'alysium-2026' }))).rejects.toBeInstanceOf(ConflictError)
  })

  it('rejeita dados inválidos (título curto)', async () => {
    const { create } = setup()
    const error = await create.execute(createCommand({ title: 'x' })).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ValidationError)
    expect((error as ValidationError).details).toMatchObject({
      fieldErrors: { title: expect.any(Array) }
    })
  })
})

describe('Workflow editorial — Author não publica direto', () => {
  it('member cria e submete; somente Admin/Editor publica após review', async () => {
    const { create, submit, publish, repo, events } = setup()
    const created = await create.execute(createCommand())

    await submit.execute({ actor: member, id: created.id })
    expect((await repo.findById(created.id))?.status).toBe('review')

    const published = await publish.execute({ actor: editor, id: created.id })
    const post = await repo.findById(created.id)
    expect(post?.status).toBe('published')
    expect(post?.data.publishedAt).toBeInstanceOf(Date)
    expect(published.publishedAt).toBeInstanceOf(Date)
    expect(events).toEqual(['post.created', 'post.updated', 'post.published'])
  })

  it('member não pode publicar (ForbiddenError)', async () => {
    const { create, submit, publish } = setup()
    const created = await create.execute(createCommand())
    await submit.execute({ actor: member, id: created.id })
    await expect(publish.execute({ actor: member, id: created.id })).rejects.toBeInstanceOf(
      ForbiddenError
    )
  })

  it('publicação só é válida a partir de review (draft → published rejeitado)', async () => {
    const { create, publish } = setup()
    const created = await create.execute(createCommand())
    await expect(publish.execute({ actor: editor, id: created.id })).rejects.toThrow(
      /não pode ser publicado/
    )
  })

  it('submit duplicado (review → review) é rejeitado', async () => {
    const { create, submit } = setup()
    const created = await create.execute(createCommand())
    await submit.execute({ actor: member, id: created.id })
    await expect(submit.execute({ actor: member, id: created.id })).rejects.toThrow(
      /não pode ser submetido/
    )
  })

  it('archive somente por Admin/Editor e apenas de published', async () => {
    const { create, submit, publish, archive, repo } = setup()
    const created = await create.execute(createCommand())

    await expect(archive.execute({ actor: member, id: created.id })).rejects.toBeInstanceOf(
      ForbiddenError
    )
    await expect(archive.execute({ actor: editor, id: created.id })).rejects.toThrow(
      /não pode ser arquivado/
    )

    await submit.execute({ actor: member, id: created.id })
    await publish.execute({ actor: editor, id: created.id })
    await archive.execute({ actor: editor, id: created.id })

    expect((await repo.findById(created.id))?.status).toBe('archived')
  })
})

describe('UpdatePostUseCase', () => {
  it('autor ou Admin/Editor edita; member estranho é bloqueado', async () => {
    const { create, update, repo } = setup()
    const created = await create.execute(createCommand())

    await update.execute({ actor: member, id: created.id, input: { title: 'Título editado' } })
    expect((await repo.findById(created.id))?.data.title).toBe('Título editado')

    await expect(
      update.execute({ actor: actor('member', 'user-9'), id: created.id, input: { title: 'Título do invasor' } })
    ).rejects.toBeInstanceOf(ForbiddenError)

    await update.execute({ actor: admin, id: created.id, input: { title: 'Título pelo admin' } })
    expect((await repo.findById(created.id))?.data.title).toBe('Título pelo admin')
  })

  it('slug novo em conflito é rejeitado no update', async () => {
    const { create, update } = setup()
    const a = await create.execute(createCommand({ slug: 'post-a' }))
    await create.execute(createCommand({ title: 'Outro post', slug: 'post-b' }))
    await expect(update.execute({ actor: member, id: a.id, input: { slug: 'post-b' } })).rejects.toBeInstanceOf(ConflictError)
  })

  it('post inexistente lança NotFoundError', async () => {
    const { update } = setup()
    await expect(
      update.execute({ actor: member, id: 'nao-existe', input: { title: 'Título válido' } })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
