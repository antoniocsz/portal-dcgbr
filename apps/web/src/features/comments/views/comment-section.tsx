// apps/web/src/features/comments/views/comment-section.tsx
// View — seção de comentários de um target (post/card/deck). Só JSX e estados.

'use client'

import { useState } from 'react'
import type { CommentTargetType } from '../model/comments-api'
import { useComments } from '../viewmodels/use-comments'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'

export interface CommentSectionProps {
  targetType: CommentTargetType
  targetId: string
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { comments, total, isLoading, isError, error, create } = useComments({
    targetType,
    targetId
  })

  const handleSubmit = async (body: string) => {
    setIsSubmitting(true)
    try {
      await create.mutateAsync(body)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-10" aria-label="Comentários">
      <h2 className="text-xl font-semibold">Comentários ({total})</h2>

      <CommentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      {isLoading && <p className="text-muted-foreground">Carregando comentários…</p>}

      {isError && (
        <p className="text-destructive">
          {error instanceof Error ? error.message : 'Não foi possível carregar os comentários.'}
        </p>
      )}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>
      )}

      {!isLoading && !isError && comments.length > 0 && (
        <ul className="mt-4 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
