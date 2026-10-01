// apps/web/src/features/comments/views/comment-form.tsx
// View — formulário de novo comentário. Só JSX (estado local de texto é UI state).

'use client'

import { useState } from 'react'

export interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>
  isSubmitting: boolean
}

export function CommentForm({ onSubmit, isSubmitting }: CommentFormProps) {
  const [body, setBody] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || isSubmitting) return
    await onSubmit(trimmed)
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <label htmlFor="comment-body" className="sr-only">
        Seu comentário
      </label>
      <textarea
        id="comment-body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Escreva um comentário… (é preciso estar logado)"
        className="w-full rounded-md border border-input bg-background p-2 text-sm"
      />
      <button
        type="submit"
        disabled={isSubmitting || !body.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {isSubmitting ? 'Publicando…' : 'Publicar'}
      </button>
    </form>
  )
}
