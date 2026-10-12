// Path: apps/web/src/features/decks/views/deck-image-export-button.tsx
// View pura (só JSX/estado de UI): botão de export do deck em PNG com estados
// claros (gerando / pronto / falhou), prévia da imagem e download. Toda a
// geração roda no ViewModel useDeckImageExport — aqui só disparamos callbacks.
'use client'

import { Button } from '@/components'
import type { Deck } from '../model/types'
import type { DeckSectionGroup } from '../viewmodels/deck-sections'
import {
  useDeckImageExport,
  type DeckImageCardVisual
} from '../viewmodels/use-deck-image-export'

export interface DeckImageExportButtonProps {
  deck: Deck
  group: DeckSectionGroup
  coverImageUrl: string | null
  resolveCard: (cardId: string) => DeckImageCardVisual | null
}

export function DeckImageExportButton({
  deck,
  group,
  coverImageUrl,
  resolveCard
}: DeckImageExportButtonProps) {
  const vm = useDeckImageExport({ deck, group, coverImageUrl, resolveCard })
  const isGenerating = vm.status === 'generating'
  const isReady = vm.status === 'ready' && vm.previewUrl !== null

  const label = isGenerating
    ? 'Gerando imagem…'
    : vm.status === 'error'
      ? 'Tentar novamente'
      : 'Gerar imagem do deck'

  return (
    <div className="flex flex-col gap-4">
      {isReady ? (
        <div className="flex flex-col gap-3">
          <div className="max-h-80 overflow-auto border border-border bg-bg p-2">
            {/* Prévia do canvas em memória (blob:) — não passa pelo next/image. */}
            <img
              src={vm.previewUrl ?? ''}
              alt={`Prévia do deck ${deck.name} exportado em PNG`}
              className="mx-auto w-full max-w-md object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="sm" onClick={vm.download}>
              Baixar PNG
            </Button>
            <Button variant="dark" size="sm" onClick={() => void vm.generate()}>
              Gerar novamente
            </Button>
          </div>
          <p className="text-[11px] text-ink-faint">{vm.fileName}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="sm" disabled={isGenerating} onClick={() => void vm.generate()}>
            {label}
          </Button>
          <p className="text-[11px] text-ink-faint">
            O PNG inclui o cabeçalho, o formato, as cores e a decklist com a arte das cartas.
          </p>
        </div>
      )}

      {vm.status === 'error' && vm.error ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.error}
        </p>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {isGenerating
          ? 'Gerando imagem do deck…'
          : isReady
            ? 'Imagem do deck pronta para download.'
            : ''}
      </span>
    </div>
  )
}
