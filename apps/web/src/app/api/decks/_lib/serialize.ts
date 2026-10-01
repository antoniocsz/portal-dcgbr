// Path: apps/web/src/app/api/decks/_lib/serialize.ts
// Serialização dos agregados de deck para JSON (Dates → ISO strings).
// Listagens usam o resumo (sem cardList/description) para manter a resposta leve.
import type { PaginatedResult } from '@digimon/contracts'
import type { Deck, DeckCardEntry } from '@digimon/decks'

export interface DeckDTO {
  id: string
  slug: string
  name: string
  ownerId: string
  description: string | null
  cardList: DeckCardEntry[]
  format: string
  status: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface DeckSummaryDTO {
  id: string
  slug: string
  name: string
  ownerId: string
  format: string
  status: string
  isPublic: boolean
  cardCount: number
}

export function serializeDeck(deck: Deck): DeckDTO {
  const d = deck.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    ownerId: d.ownerId,
    description: d.description,
    cardList: d.cardList,
    format: d.format,
    status: d.status,
    isPublic: d.isPublic,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

export function serializeSummary(deck: Deck): DeckSummaryDTO {
  const d = deck.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    ownerId: d.ownerId,
    format: d.format,
    status: d.status,
    isPublic: d.isPublic,
    cardCount: d.cardList.reduce((sum, entry) => sum + entry.quantity, 0)
  }
}

export function serializeList(
  result: PaginatedResult<Deck>
): PaginatedResult<DeckSummaryDTO> {
  return {
    items: result.items.map(serializeSummary),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}
