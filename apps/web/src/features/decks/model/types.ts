// Path: apps/web/src/features/decks/model/types.ts
// Tipos da feature decks (espelho dos DTOs da API /api/decks).
// Decisão: o frontend não importa @digimon/decks no client (evita arrastar
// @digimon/database para o bundle) — tipos literais mantidos em sync com o backend.
export type DeckStatus = 'draft' | 'published'

export interface DeckCardEntry {
  cardId: string
  quantity: number
}

export interface DeckSummary {
  id: string
  slug: string
  name: string
  ownerId: string
  format: string
  status: DeckStatus
  isPublic: boolean
  cardCount: number
}

export interface Deck extends DeckSummary {
  description: string | null
  cardList: DeckCardEntry[]
  createdAt: string
  updatedAt: string
}

export interface DeckInput {
  name: string
  slug?: string
  description?: string | null
  cardList: DeckCardEntry[]
  format: string
  status?: DeckStatus
  isPublic?: boolean
}

export interface CreateDeckResult {
  id: string
  slug: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListDecksParams {
  search?: string
  format?: string
  status?: DeckStatus
  page?: number
  pageSize?: number
  mine?: boolean
}

export const STATUS_LABELS: Record<DeckStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado'
}
