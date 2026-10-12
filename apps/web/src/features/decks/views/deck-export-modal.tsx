// Path: apps/web/src/features/decks/views/deck-export-modal.tsx
// View pura: exporta o deck — decklist em texto (DigimonCard.io) e, quando o
// slot `imageExport` é fornecido, uma aba com a exportação em PNG. Sem hooks de
// dados — recebe texto, conteúdo do slot e callbacks do ViewModel.
'use client'

import { useState, type ReactNode } from 'react'
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
  imageExport?: ReactNode
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
  onClose,
  imageExport = null
}: DeckExportModalProps) {
  const [tab, setTab] = useState<'text' | 'image'>('text')

  if (!open) return null

  const hasImage = imageExport !== null

  const textPanel = isLoading ? (
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
  )

  const downloadActions = (
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
  )

  const tabClass = (active: boolean): string =>
    active
      ? 'border-b-2 border-primary px-3 py-2 text-[13px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
      : 'border-b-2 border-transparent px-3 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'

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
            {hasImage ? 'Exportar deck' : 'Exportar decklist'}
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

        {hasImage ? (
          <>
            <div
              role="tablist"
              aria-label="Formato de exportação"
              className="mt-4 flex gap-1 border-b border-border"
            >
              <button
                type="button"
                role="tab"
                id="deck-export-text-tab"
                aria-selected={tab === 'text'}
                aria-controls="deck-export-text-panel"
                onClick={() => setTab('text')}
                className={tabClass(tab === 'text')}
              >
                Texto
              </button>
              <button
                type="button"
                role="tab"
                id="deck-export-image-tab"
                aria-selected={tab === 'image'}
                aria-controls="deck-export-image-panel"
                onClick={() => setTab('image')}
                className={tabClass(tab === 'image')}
              >
                Imagem
              </button>
            </div>

            <div
              role="tabpanel"
              id="deck-export-text-panel"
              aria-labelledby="deck-export-text-tab"
              hidden={tab !== 'text'}
            >
              {textPanel}
              {downloadActions}
              <p className="pt-2 text-right text-[11px] text-ink-faint">{fileName}</p>
            </div>

            <div
              role="tabpanel"
              id="deck-export-image-panel"
              aria-labelledby="deck-export-image-tab"
              hidden={tab !== 'image'}
              className="pt-4"
            >
              {imageExport}
            </div>
          </>
        ) : (
          <>
            {textPanel}
            {downloadActions}
            <p className="pt-2 text-right text-[11px] text-ink-faint">{fileName}</p>
          </>
        )}
      </div>
    </div>
  )
}
