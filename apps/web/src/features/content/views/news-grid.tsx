// Path: apps/web/src/features/content/views/news-grid.tsx
// View presentacional: grade de notícias (PostCard do design system) com
// estados de loading (skeleton), erro e vazio.
import { Button, PostCard, type PostCardData } from '@/components'

export interface NewsGridProps {
  posts: PostCardData[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyMessage?: string
}

function GridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando notícias">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex flex-col border border-border bg-surface">
          <div className="h-44 animate-pulse bg-surface-2" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-5 w-20 animate-pulse bg-surface-2" />
            <div className="h-4 w-full animate-pulse bg-surface-2" />
            <div className="h-4 w-3/4 animate-pulse bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NewsGrid({
  posts,
  isLoading = false,
  isError = false,
  onRetry,
  emptyMessage = 'Nenhuma notícia publicada ainda.'
}: NewsGridProps) {
  if (isLoading) return <GridSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-soft">Não foi possível carregar as notícias.</p>
        {onRetry ? (
          <Button variant="dark" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="border border-border bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-soft">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.href ?? post.title} post={post} />
      ))}
    </div>
  )
}
