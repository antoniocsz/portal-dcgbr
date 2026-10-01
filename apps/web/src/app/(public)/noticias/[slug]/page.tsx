// Path: apps/web/src/app/(public)/noticias/[slug]/page.tsx
// Leitura de notícia (SEO-first): SSR do artigo + generateMetadata com o slug.
// O post é buscado server-side na API pública; comentários via feature comments.
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { CommentSection } from '@/features/comments/views/comment-section'
import type { Post } from '@/features/content/model/types'
import { PORTAL_AUTHOR } from '@/features/content/viewmodels/post-view'
import { PostArticle } from '@/features/content/views'

async function fetchPost(slug: string): Promise<Post | null> {
  const headerList = await headers()
  const host = headerList.get('host')
  if (!host) return null

  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const url = `${protocol}://${host}/api/posts/${encodeURIComponent(slug)}`

  try {
    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return null
    return (await response.json()) as Post
  } catch {
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPost(slug)

  if (!post) return { title: 'Notícia não encontrada' }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/noticias/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt ?? undefined
    }
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchPost(slug)

  if (!post) notFound()

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col px-4 pb-12 lg:px-0">
      <PostArticle post={post} authorName={PORTAL_AUTHOR} />
      <div className="pt-10">
        <CommentSection targetType="post" targetId={post.id} />
      </div>
    </div>
  )
}
