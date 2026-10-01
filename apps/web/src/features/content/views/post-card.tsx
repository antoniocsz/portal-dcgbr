// Path: apps/web/src/features/content/views/post-card.tsx
// View presentacional: card de post (listagens públicas/editoriais).
import { CATEGORY_LABELS, type PostSummary } from '../model/types'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso))
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="aspect-video w-full rounded-md object-cover" />
      ) : null}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
          {CATEGORY_LABELS[post.category]}
        </span>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold leading-snug">{post.title}</h3>
      {post.excerpt ? <p className="text-sm text-muted-foreground">{post.excerpt}</p> : null}
    </article>
  )
}
