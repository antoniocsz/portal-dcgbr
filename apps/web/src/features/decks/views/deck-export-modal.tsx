// Path: apps/web/src/features/decks/views/deck-export-modal.tsx
// View pura: exporta a decklist (texto DigimonCard.io) para copiar ou baixar.
// Sem hooks de dados — recebe texto + callbacks do ViewModel.
'use client'

import { Button, X } from '@/components'

export interface DeckExportModalProps {
  open: boolean
  text: string
  fileName: string
  isLoading?: boolean
  error?: string | null
  copied?: boolean
  onCopy: () => void
  onDownload: () => void
  onClose: () => void
}

export function DeckExportModal({
  open,
  text,
  fileName,
  isLoading = false,
  error = null,
  copied = false,
  onCopy,
  onDownload,
  onClose
}: DeckExportModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-export-title"
    >
      <div className="w-full max-w-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="deck-export-title" className="font-display text-lg font-bold text-ink">
            Exportar decklist
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

        {isLoading ? (
          <div className="mt-4 h-40 animate-pulse bg-surface-2" aria-busy="true" aria-label="Carregando decklist" />
        ) : error ? (
          <p role="alert" className="pt-4 text-sm font-semibold text-danger">
            {error}
          </p>
        ) : (
          <>
            <label htmlFor="deck-export-text" className="mt-4 block text-xs font-semibold text-ink-soft">
              Decklist (DigimonCard.io)
            </label>
            <textarea
              id="deck-export-text"
              readOnly
              value={text}
              rows={9}
              className="mt-1.5 w-full resize-y border border-border bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink outline-none"
            />
          </>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-6">
          <Button variant="dark" size="sm" onClick={onDownload} disabled={isLoading || text === ''}>
            Baixar .txt
          </Button>
          <Button variant="primary" size="sm" onClick={onCopy} disabled={isLoading || text === ''}>
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Decklist copiada para a área de transferência' : ''}
          </span>
        </div>
        <p className="pt-2 text-right text-[11px] text-ink-faint">{fileName}</p>
      </div>
    </div>
  )
}
