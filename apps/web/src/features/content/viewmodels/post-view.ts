// Path: apps/web/src/features/content/viewmodels/post-view.ts
// Helpers de apresentação (sem hooks, sem JSX): mapeiam DTOs da API para props das Views.
import type { PostCardData } from '@/components'
import type { PostCategory, PostSummary } from '../model/types'
import { CATEGORY_LABELS } from '../model/types'

// A API pública expõe apenas `authorId` (UUID); não há endpoint de perfil público.
// Até existir, a assinatura editorial usa o byline do portal.
export const PORTAL_AUTHOR = 'Equipe DigiTCG'

export function categoryLabel(category: PostCategory | string): string {
  return CATEGORY_LABELS[category as PostCategory] ?? 'Notícias'
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(iso))
}

export function estimateReadingTime(body: string | null | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min`
}

export interface FeaturedPostView {
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  categoryLabel: string
  authorName: string
  publishedLabel: string
  href: string
}

export function toFeaturedPostView(post: PostSummary): FeaturedPostView {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    categoryLabel: categoryLabel(post.category),
    authorName: PORTAL_AUTHOR,
    publishedLabel: formatPostDate(post.publishedAt),
    href: `/noticias/${post.slug}`
  }
}

export function toPostCardData(post: PostSummary): PostCardData {
  const data: PostCardData = {
    category: categoryLabel(post.category),
    title: post.title,
    authorName: PORTAL_AUTHOR,
    href: `/noticias/${post.slug}`
  }
  if (post.excerpt) data.excerpt = post.excerpt
  if (post.coverImage) data.coverImage = post.coverImage
  const publishedAt = formatPostDate(post.publishedAt)
  if (publishedAt) data.publishedAt = publishedAt
  return data
}
