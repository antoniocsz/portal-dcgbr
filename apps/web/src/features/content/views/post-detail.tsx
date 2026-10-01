// Path: apps/web/src/features/content/views/post-detail.tsx
// View presentacional: leitura completa de um post.
import { CATEGORY_LABELS, type Post } from '../model/types'
import { sanitizePostBody } from '@/lib/sanitize'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(iso))
}

export function PostDetail({ post }: { post: Post }) {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
            {CATEGORY_LABELS[post.category]}
          </span>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          ) : null}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.excerpt ? <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p> : null}
      </header>
      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="mb-6 aspect-video w-full rounded-lg object-cover" />
      ) : null}
      <div className="prose prose-invert max-w-none">
        {/* HTML sanitizado no servidor (allowlist) — ver lib/sanitize.ts */}
        <div dangerouslySetInnerHTML={{ __html: sanitizePostBody(post.body) }} />
      </div>
    </article>
  )
}
