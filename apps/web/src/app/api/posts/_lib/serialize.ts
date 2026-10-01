// Path: apps/web/src/app/api/posts/_lib/serialize.ts
// Serialização dos agregados do módulo para JSON (Dates → ISO strings).
// Listagens usam o resumo (sem body) para manter a resposta leve.
import type { PaginatedResult } from '@digimon/contracts'
import type { Post } from '@digimon/content'

export interface PostDTO {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  coverImage: string | null
  category: string
  status: string
  authorId: string
  authorName?: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PostSummaryDTO {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category: string
  status: string
  authorId?: string
  authorName?: string
  publishedAt: string | null
  updatedAt: string
}

export function serializePost(post: Post, authorName?: string): PostDTO {
  const d = post.data
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    coverImage: d.coverImage,
    category: d.category,
    status: d.status,
    authorId: d.authorId,
    ...(authorName ? { authorName } : {}),
    publishedAt: d.publishedAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

export function serializePostSummary(post: Post, authorName?: string): PostSummaryDTO {
  const d = post.data
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    coverImage: d.coverImage,
    category: d.category,
    status: d.status,
    ...(authorName ? { authorId: d.authorId, authorName } : {}),
    publishedAt: d.publishedAt?.toISOString() ?? null,
    updatedAt: d.updatedAt.toISOString()
  }
}

export function serializeList(result: PaginatedResult<Post>): PaginatedResult<PostSummaryDTO> {
  return {
    items: result.items.map((post) => serializePostSummary(post)),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

/** Listagem com authorName (uso editorial): resolve os nomes dos autores. */
export function serializeListWithAuthors(
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
