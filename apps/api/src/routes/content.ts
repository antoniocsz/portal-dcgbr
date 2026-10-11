// Path: apps/api/src/routes/content.ts
// Rotas de conteúdo/posts em Fastify — porte dos route handlers de
// apps/web/src/app/api/posts/** (strangler, ADR-007). Contratos JSON idênticos;
// workflow editorial (draft → review → published → archived) intacto; os erros
// fluem pelo handler global (AppError → { error: { code, message, details } }).
// Helpers que no web viviam em _lib/ (serialize/authors/session) ficam inline,
// pois o escopo desta task permite somente este arquivo.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { PaginatedResult } from '@digimon/contracts'
import { NotFoundError, UnauthorizedError } from '@digimon/contracts'
import { prisma } from '@digimon/database'
import { isEditorial, listPostsSchema } from '@digimon/content'
import type {
  Actor,
  CreatePostInput,
  ListPostsInput,
  Post,
  UpdatePostInput
} from '@digimon/content'
import { contentDeps } from '../container'
import { authenticate, requireRoleHook } from '../plugins/auth'

// ---- Composição do módulo (DIP): factories centralizadas no container ----
const { posts, postRepo } = contentDeps()

// ---- DTOs / serialização (Dates → ISO; listagem sem body) ----
interface PostDTO {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImage: string | null
  externalUrl: string | null
  category: string
  status: string
  authorId: string
  authorName?: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface PostSummaryDTO {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  externalUrl: string | null
  category: string
  status: string
  authorId?: string
  authorName?: string
  publishedAt: string | null
  updatedAt: string
}

function serializePost(post: Post, authorName?: string): PostDTO {
  const d = post.data
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    coverImage: d.coverImage,
    externalUrl: d.externalUrl,
    category: d.category,
    status: d.status,
    authorId: d.authorId,
    ...(authorName ? { authorName } : {}),
    publishedAt: d.publishedAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializePostSummary(post: Post, authorName?: string): PostSummaryDTO {
  const d = post.data
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    coverImage: d.coverImage,
    externalUrl: d.externalUrl,
    category: d.category,
    status: d.status,
    ...(authorName ? { authorId: d.authorId, authorName } : {}),
    publishedAt: d.publishedAt?.toISOString() ?? null,
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializeList(result: PaginatedResult<Post>): PaginatedResult<PostSummaryDTO> {
  return {
    items: result.items.map((post) => serializePostSummary(post)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

/** Listagem editorial: resolve os nomes dos autores para os DTOs. */
function serializeListWithAuthors(
  result: PaginatedResult<Post>,
  authorNames: Map<string, string>
): PaginatedResult<PostSummaryDTO> {
  return {
    items: result.items.map((post) =>
      serializePostSummary(post, authorNames.get(post.data.authorId) ?? undefined)
    ),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

/** Mapa authorId → name (consulta única por lote; a entidade Post não carrega o autor). */
async function resolveAuthorNames(authorIds: string[]): Promise<Map<string, string>> {
  const ids = [...new Set(authorIds.filter(Boolean))]
  if (ids.length === 0) return new Map()
  const rows = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true }
  })
  return new Map(rows.map((row) => [row.id, row.name]))
}

function requireActor(request: FastifyRequest): Actor {
  if (!request.auth) throw new UnauthorizedError('Não autenticado')
  return { id: request.auth.userId, role: request.auth.role }
}

const LIST_QUERY_KEYS = ['category', 'status', 'page', 'pageSize'] as const

/** Normaliza a query string (valores vazios → ausentes, como no web) e valida. */
function parseListQuery(query: unknown): ListPostsInput {
  const source = (query ?? {}) as Record<string, unknown>
  const raw: Record<string, unknown> = {}
  for (const key of LIST_QUERY_KEYS) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') raw[key] = value
  }
  return listPostsSchema.parse(raw)
}

/** Leitura editorial por id (qualquer status). Fronteira igual à do GetPost:
 *  não-publicado só para Admin/Editor — NotFound sem vazar existência. */
async function getEditorialPostById(id: string, actor: Actor): Promise<Post> {
  const post = await postRepo.findById(id)
  if (!post) throw new NotFoundError('Post não encontrado')
  if (!post.isPublished && !isEditorial(actor)) throw new NotFoundError('Post não encontrado')
  return post
}

const editorialOnly = requireRoleHook(['administrator', 'editor'])

export const contentRoutes: FastifyPluginAsync = async (app) => {
  // ---- Públicas ----
  // GET /posts — listagem pública (somente published; SEO-friendly).
  app.get('/posts', async (request, reply) => {
    const input = parseListQuery(request.query)
    const result = await posts.list.execute({ input })
    return reply.send(serializeList(result))
  })

  // GET /posts/simulators — página pública de Simuladores (published da categoria).
  app.get('/posts/simulators', async (_request, reply) => {
    const result = await posts.simulators.execute()
    const authorNames = await resolveAuthorNames(result.posts.map((post) => post.data.authorId))
    return reply.send({
      category: result.category,
      posts: result.posts.map((post) =>
        serializePostSummary(post, authorNames.get(post.data.authorId) ?? undefined)
      )
    })
  })

  // GET /posts/:slug — leitura pública por slug (rascunhos não vazam: 404).
  app.get<{ Params: { slug: string } }>('/posts/:slug', async (request, reply) => {
    const post = await posts.get.execute({ slug: request.params.slug })
    return reply.send(serializePost(post))
  })

  // ---- Admin (editorial) ----
  // POST /posts/admin — cria rascunho (qualquer usuário autenticado) → 201.
  app.post<{ Body: CreatePostInput }>(
    '/posts/admin',
    { preHandler: authenticate },
    async (request, reply) => {
      const actor = requireActor(request)
      const result = await posts.create.execute({ actor, input: request.body })
      return reply.status(201).send(result)
    }
  )

  // GET /posts/admin — listagem editorial (Admin/Editor; filtra por status).
  app.get('/posts/admin', { preHandler: [authenticate, editorialOnly] }, async (request, reply) => {
    const actor = requireActor(request)
    const input = parseListQuery(request.query)
    const result = await posts.list.execute({ input, actor })
    const authorNames = await resolveAuthorNames(result.items.map((post) => post.data.authorId))
    return reply.send(serializeListWithAuthors(result, authorNames))
  })

  // GET /posts/admin/:id — post por id, qualquer status (Admin/Editor).
  app.get<{ Params: { id: string } }>(
    '/posts/admin/:id',
    { preHandler: [authenticate, editorialOnly] },
    async (request, reply) => {
      const actor = requireActor(request)
      const post = await getEditorialPostById(request.params.id, actor)
      const authorNames = await resolveAuthorNames([post.data.authorId])
      return reply.send(serializePost(post, authorNames.get(post.data.authorId) ?? undefined))
    }
  )

  // PATCH /posts/admin/:id — edita post (autor do post OU Admin/Editor).
  app.patch<{ Params: { id: string }; Body: UpdatePostInput }>(
    '/posts/admin/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const actor = requireActor(request)
      const result = await posts.update.execute({
        actor,
        id: request.params.id,
        input: request.body
      })
      return reply.send(result)
    }
  )

  // POST /posts/admin/:id/submit — draft → review (autor OU Admin/Editor).
  app.post<{ Params: { id: string } }>(
    '/posts/admin/:id/submit',
    { preHandler: authenticate },
    async (request, reply) => {
      const actor = requireActor(request)
      const result = await posts.submitForReview.execute({ actor, id: request.params.id })
      return reply.send(result)
    }
  )

  // POST /posts/admin/:id/publish — review → published (Admin/Editor — regra central).
  app.post<{ Params: { id: string } }>(
    '/posts/admin/:id/publish',
    { preHandler: [authenticate, editorialOnly] },
    async (request, reply) => {
      const actor = requireActor(request)
      const result = await posts.publish.execute({ actor, id: request.params.id })
      return reply.send(result)
    }
  )

  // POST /posts/admin/:id/archive — published → archived (Admin/Editor).
  app.post<{ Params: { id: string } }>(
    '/posts/admin/:id/archive',
    { preHandler: [authenticate, editorialOnly] },
    async (request, reply) => {
      const actor = requireActor(request)
      const result = await posts.archive.execute({ actor, id: request.params.id })
      return reply.send(result)
    }
  )
}
