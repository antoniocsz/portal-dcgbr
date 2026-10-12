// Path: apps/web/src/features/decks/viewmodels/deck-view.ts
// Helpers de apresentação (sem hooks, sem JSX): mapeiam DTOs da API para props
// das Views — DeckCard do design system (decks próprios e da comunidade) e labels.
import type { DeckCardData } from '@/components'
import type { CommunityDeckSummary } from '../model/community-types'
import type { DeckStatus, DeckSummary } from '../model/types'
import { STATUS_LABELS } from '../model/types'
import { dominantColors } from './deck-sections'

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

/** Formata uma data ISO como tempo relativo curto ("há 3 h"). */
export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'agora'
  if (diff < hour) return `há ${Math.floor(diff / minute)} min`
  if (diff < day) return `há ${Math.floor(diff / hour)} h`
  if (diff < 7 * day) return `há ${Math.floor(diff / day)} dias`
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso))
}

export function toCommunityDeckCardData(deck: CommunityDeckSummary): DeckCardData {
  return {
    name: deck.name,
    colors: dominantColors(deck.colors),
    meta: `${deck.ownerName} · ${formatRelativeDate(deck.updatedAt)}`,
    likeCount: deck.likeCount,
    copyCount: deck.copyCount,
    liked: deck.likedByMe,
    legal: deck.legal
  }
}
