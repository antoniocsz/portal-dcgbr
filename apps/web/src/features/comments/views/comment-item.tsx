// apps/web/src/features/comments/views/comment-item.tsx
// View — item de comentário (autor, corpo, data). Só JSX.

import type { CommentDTO } from '../model/comments-api'

export interface CommentItemProps {
  comment: CommentDTO
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <article className="rounded-md border border-border p-3">
      <header className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="font-medium">{comment.authorId}</span>
        <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
      </header>
      <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
    </article>
  )
}
