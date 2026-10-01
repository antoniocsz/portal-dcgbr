// Path: packages/modules/content/src/use-cases/post-reading.spec.ts
// Critérios: leitura pública não expõe rascunhos; categoria simulator agrega
// conteúdo de simuladores (Alysium + fan-made).
import { describe, expect, it } from 'vitest'
import type { PaginatedResult, Role } from '@digimon/contracts'
import { InMemoryEventBus, NotFoundError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Post, type PostData } from '../domain/entities/post'
import type { ListPostsParams, PostRepository } from '../domain/repositories/post-repository'
import { CreatePostUseCase } from './create-post'
import { GetPostUseCase } from './get-post'
import { GetSimulatorsPageUseCase } from './get-simulators-page'
import { ListPostsUseCase } from './list-posts'
import { PublishPostUseCase } from './publish-post'
import { SubmitForReviewUseCase } from './submit-for-review'

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

function setup() {
  const repo = new InMemoryPostRepository()
  const eventBus = new InMemoryEventBus()
  return {
    repo,
    create: new CreatePostUseCase(repo, eventBus),
    submit: new SubmitForReviewUseCase(repo, eventBus),
    publish: new PublishPostUseCase(repo, eventBus),
    get: new GetPostUseCase(repo),
    list: new ListPostsUseCase(repo),
    simulators: new GetSimulatorsPageUseCase(repo)
  }
}

async function publishPost(
  app: ReturnType<typeof setup>,
  input: { title: string; slug?: string; category: 'news' | 'article' | 'curiosity' | 'simulator' }
) {
  const created = await app.create.execute({ actor: member, input: { title: input.title, body: 'corpo', category: input.category, slug: input.slug } })
  await app.submit.execute({ actor: member, id: created.id })
  await app.publish.execute({ actor: editor, id: created.id })
  return created
}

describe('GetPostUseCase — leitura pública', () => {
  it('não expõe rascunhos ao público (NotFoundError, sem vazar existência)', async () => {
    const app = setup()
    const created = await app.create.execute({ actor: member, input: { title: 'Rascunho secreto', slug: 'rascunho-secreto', body: 'x', category: 'news' } })

    await expect(app.get.execute({ slug: created.slug })).rejects.toBeInstanceOf(NotFoundError)
    await expect(app.get.execute({ slug: created.slug, actor: member })).rejects.toBeInstanceOf(
      NotFoundError
    )
  })

  it('Admin/Editor leem rascunhos (versão de edição)', async () => {
    const app = setup()
    const created = await app.create.execute({ actor: member, input: { title: 'Rascunho', slug: 'rascunho-editorial', body: 'x', category: 'news' } })

    const post = await app.get.execute({ slug: created.slug, actor: editor })
    expect(post.status).toBe('draft')
  })

  it('lê posts published publicamente por slug', async () => {
    const app = setup()
    const created = await publishPost(app, { title: 'Notícia publicada', slug: 'noticia-publicada', category: 'news' })

    const post = await app.get.execute({ slug: created.slug })
    expect(post.status).toBe('published')
  })

  it('slug inexistente lança NotFoundError', async () => {
    const app = setup()
    await expect(app.get.execute({ slug: 'nao-existe' })).rejects.toBeInstanceOf(NotFoundError)
  })
})

describe('ListPostsUseCase — listagem pública', () => {
  it('público vê somente published, mesmo pedindo outro status', async () => {
    const app = setup()
    await app.create.execute({ actor: member, input: { title: 'Draft', slug: 'draft', body: 'x', category: 'news' } })
    await publishPost(app, { title: 'Publicada', slug: 'publicada', category: 'news' })

    const result = await app.list.execute({ input: {} })
    expect(result.items.map((p) => p.slug)).toEqual(['publicada'])

    const filtered = await app.list.execute({ input: { status: 'draft' } })
    // status é forçado para published no público — o draft nunca aparece
    expect(filtered.items.map((p) => p.slug)).toEqual(['publicada'])
  })

  it('Admin/Editor filtram por status (rascunhos visíveis no painel)', async () => {
    const app = setup()
    await app.create.execute({ actor: member, input: { title: 'Draft', slug: 'draft', body: 'x', category: 'news' } })

    const result = await app.list.execute({ input: { status: 'draft' }, actor: editor })
    expect(result.items.map((p) => p.slug)).toEqual(['draft'])
  })

  it('filtra por categoria e pagina', async () => {
    const app = setup()
    await publishPost(app, { title: 'Notícia 1', slug: 'n1', category: 'news' })
    await publishPost(app, { title: 'Notícia 2', slug: 'n2', category: 'news' })
    await publishPost(app, { title: 'Artigo', slug: 'a1', category: 'article' })

    const news = await app.list.execute({ input: { category: 'news', pageSize: 1, page: 1 } })
    expect(news.items).toHaveLength(1)
    expect(news.total).toBe(2)

    const page2 = await app.list.execute({ input: { category: 'news', pageSize: 1, page: 2 } })
    expect(page2.items).toHaveLength(1)
    expect(page2.items[0]?.slug).not.toBe(news.items[0]?.slug)
  })
})

describe('GetSimulatorsPageUseCase — categoria simulator', () => {
  it('agrega somente posts published da categoria simulator (Alysium + fan-made)', async () => {
    const app = setup()
    await publishPost(app, { title: 'Alysium: simulador oficial chega em 2026', slug: 'alysium-oficial', category: 'simulator' })
    await publishPost(app, { title: 'Melhores simuladores fan-made', slug: 'simuladores-fan-made', category: 'simulator' })
    await publishPost(app, { title: 'Notícia comum', slug: 'noticia-comum', category: 'news' })
    // draft de simulator não deve aparecer
    await app.create.execute({ actor: member, input: { title: 'Simulator em draft', slug: 'sim-draft', body: 'x', category: 'simulator' } })

    const page = await app.simulators.execute()
    expect(page.category.id).toBe('simulator')
    expect(page.category.slug).toBe('simuladores')
    expect(page.posts.map((p) => p.slug)).toEqual(expect.arrayContaining(['simuladores-fan-made', 'alysium-oficial']))
    expect(page.posts).toHaveLength(2)
    expect(page.posts.every((p) => p.status === 'published')).toBe(true)
  })
})
