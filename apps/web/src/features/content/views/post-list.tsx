// Path: apps/web/src/features/content/views/post-list.tsx
// View presentacional: grade de posts com estados loading / erro / vazio.
import type { PostSummary } from '../model/types'
import { PostCard } from './post-card'

export interface PostListProps {
  posts: PostSummary[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

export function PostList({ posts, isLoading = false, isError = false, onRetry }: PostListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/40 p-8 text-center">
        <p className="text-muted-foreground">Não foi possível carregar os posts.</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Tentar novamente
          </button>
        ) : null}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum post publicado ainda.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
