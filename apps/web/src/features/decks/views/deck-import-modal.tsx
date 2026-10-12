// Path: apps/web/src/features/decks/views/deck-import-modal.tsx
// View pura: importa uma decklist colada (texto/TTS). Sem hooks de dados.
'use client'

import { Button, X } from '@/components'
import type { DeckImportSummary } from '../viewmodels/use-deck-form'

export interface DeckImportModalProps {
  open: boolean
  text: string
  onChangeText: (value: string) => void
  onSubmit: () => void
  onClose: () => void
  isPending?: boolean
  error?: string | null
  summary?: DeckImportSummary | null
}

export function DeckImportModal({
  open,
  text,
  onChangeText,
  onSubmit,
  onClose,
  isPending = false,
  error = null,
  summary = null
}: DeckImportModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-import-title"
    >
      <div className="w-full max-w-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="deck-import-title" className="font-display text-lg font-bold text-ink">
            Importar decklist
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

        <p className="pt-2 text-sm leading-6 text-ink-soft">
          Cole a decklist no formato DigimonCard.io, Untap ou TTS. Eggs e cartas do main são
          separadas automaticamente.
        </p>

        <label htmlFor="deck-import-text" className="mt-4 block text-xs font-semibold text-ink-soft">
          Decklist
        </label>
        <textarea
          id="deck-import-text"
          value={text}
          onChange={(event) => onChangeText(event.target.value)}
          rows={8}
          placeholder={'// DigimonCard.io Deck List\n4 Agumon BT1-010\n...'}
          className="mt-1.5 w-full resize-y border border-border bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none transition-colors focus:border-primary placeholder:text-ink-faint"
        />

        {error ? (
          <p role="alert" className="pt-2 text-xs font-semibold text-danger">
            {error}
          </p>
        ) : null}

        {summary ? (
          <p className="pt-2 text-xs text-ink-soft" aria-live="polite">
            Importado: {summary.main} main · {summary.egg} egg. Ignoradas: {summary.skipped}.
            Cortadas pelo limite: {summary.trimmed}.
          </p>
        ) : null}

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="dark" size="sm" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSubmit}
            disabled={isPending || text.trim() === ''}
          >
            {isPending ? 'Importando…' : 'Importar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
