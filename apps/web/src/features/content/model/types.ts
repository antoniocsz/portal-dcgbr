// Path: apps/web/src/features/content/model/types.ts
// Tipos da feature content (espelho dos DTOs da API /api/posts).
// Decisão: o frontend não importa @digimon/content no client (evita arrastar
// @digimon/database para o bundle) — tipos literais mantidos em sync com o backend.
export type PostCategory = 'news' | 'article' | 'curiosity' | 'simulator'
export type PostStatus = 'draft' | 'review' | 'published' | 'archived'

export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category: PostCategory
  status: PostStatus
  publishedAt: string | null
  updatedAt: string
}

export interface Post extends PostSummary {
  body: string
  authorId: string
  createdAt: string
}

export interface PostInput {
  title: string
  slug?: string
  excerpt?: string | null
  body: string
  coverImage?: string | null
  category: PostCategory
}

export interface CreatePostResult {
  id: string
  slug: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListPostsParams {
  category?: PostCategory
  status?: PostStatus
  page?: number
  pageSize?: number
}

export const CATEGORY_LABELS: Record<PostCategory, string> = {
  news: 'Notícias',
  article: 'Artigos',
  curiosity: 'Curiosidades',
  simulator: 'Simuladores'
}
