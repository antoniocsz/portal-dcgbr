// Path: apps/web/src/components/comment-row.tsx
// View pura: linha de comentário (avatar + autor + tempo + texto + ações). Sem hooks de dados.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from './ui/avatar'

export type CommentRowProps = {
  authorName: string
  createdAt: string
  body: string
  actions?: ReactNode
  className?: string
}

export function CommentRow({ authorName, createdAt, body, actions, className }: CommentRowProps) {
  return (
    <article className={cn('flex gap-3 border border-border bg-surface p-4', className)}>
      <Avatar name={authorName} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-bold text-ink">{authorName}</span>
          <span className="text-xs text-ink-faint">{createdAt}</span>
        </div>
        <p className="text-[13px] leading-[19px] text-ink-soft">{body}</p>
        {actions ? <div className="flex gap-4">{actions}</div> : null}
      </div>
    </article>
  )
}
