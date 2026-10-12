// Path: apps/web/src/features/decks/views/deck-publish-modal.tsx
// View pura: confirmação de publicar/atualizar/despublicar na comunidade.
// Sem hooks de dados — recebe estado + callbacks do ViewModel.
'use client'

import { Button, X } from '@/components'

export interface DeckPublishModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  isPending?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function DeckPublishModal({
  open,
  title,
  message,
  confirmLabel,
  isPending = false,
  error = null,
  onConfirm,
  onClose
}: DeckPublishModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-publish-title"
    >
      <div className="w-full max-w-md border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="deck-publish-title" className="font-display text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-ink-faint transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="pt-2 text-sm leading-6 text-ink-soft">{message}</p>

        {error ? (
          <p role="alert" className="pt-3 text-xs font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Enviando…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
