// Path: apps/web/src/features/decks/viewmodels/deck-view.ts
// Helpers de apresentação (sem hooks, sem JSX): mapeiam DTOs da API para props
// das Views — DeckCard do design system + labels de status.
import type { DeckCardData } from '@/components'
import type { DeckStatus, DeckSummary } from '../model/types'
import { STATUS_LABELS } from '../model/types'

export function statusLabel(status: DeckStatus): string {
  return STATUS_LABELS[status]
}

export function toDeckCardData(summary: DeckSummary): DeckCardData {
  return {
    name: summary.name,
    colors: [],
    meta: `${summary.format} · ${summary.cardCount} cartas`
  }
}
