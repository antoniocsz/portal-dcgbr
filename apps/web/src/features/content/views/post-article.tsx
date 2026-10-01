// Path: apps/web/src/features/content/views/post-article.tsx
// View presentacional (server-safe): leitura completa de um post — tag, título,
// resumo, autoria, capa e corpo. Sem hooks (renderizável em SSR para SEO).
import { Avatar, Sparkles, Tag } from '@/components'
import type { Post } from '../model/types'
import { categoryLabel, estimateReadingTime, formatPostDate } from '../viewmodels/post-view'
import { sanitizePostBody } from '@/lib/sanitize'

export interface PostArticleProps {
  post: Post
  authorName: string
}

export function PostArticle({ post, authorName }: PostArticleProps) {
  const bodyHtml = sanitizePostBody(post.body)

  return (
    <article className="flex flex-col gap-4 pt-10">
      <Tag className="uppercase tracking-wider">{categoryLabel(post.category)}</Tag>

      <h1 className="font-display text-3xl font-bold leading-tight text-ink lg:text-[36px] lg:leading-[41px]">
        {post.title}
      </h1>

      {post.excerpt ? (
        <p className="text-base leading-6 text-ink-soft lg:text-[17px] lg:leading-[26px]">
          {post.excerpt}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <Avatar name={authorName} size="md" />
        <span className="text-[13px] font-bold text-ink">{authorName}</span>
        {post.publishedAt ? (
          <span className="text-[13px] text-ink-faint">
            · {formatPostDate(post.publishedAt)} · {estimateReadingTime(post.body)} de leitura
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex h-[240px] items-center justify-center overflow-hidden lg:h-[420px]">
        {post.coverImage ? (
          <img src={post.coverImage} alt="" className="size-full object-cover" />
        ) : (
          <div
            className="flex size-full items-center justify-center bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,#C22B33_0%,#0C0C0E_100%)]"
            aria-hidden="true"
          >
            <Sparkles className="size-16 text-white/80" />
          </div>
        )}
      </div>

      <div className="prose prose-invert max-w-none">
        {/* HTML sanitizado no servidor (allowlist) — ver lib/sanitize.ts */}
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </div>
    </article>
  )
}
