// Path: apps/web/src/features/decks/model/decks-api.ts
// Repository da feature: chamadas à API separada (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import { apiClient } from '@/lib/api-base'
import type {
  CreateDeckResult,
  Deck,
  DeckInput,
  DeckSummary,
  ListDecksParams,
  Paginated
} from './types'

export { ApiError } from '@digimon/api-client'

function buildQuery(params: ListDecksParams): string {
  const search = new URLSearchParams()
  if (params.search) search.set('search', params.search)
  if (params.format) search.set('format', params.format)
  if (params.status) search.set('status', params.status)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  if (params.mine) search.set('mine', 'true')
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const decksApi = {
  listDecks(params: ListDecksParams = {}): Promise<Paginated<DeckSummary>> {
    return apiClient.get(`/decks${buildQuery(params)}`)
  },

  getDeck(slug: string): Promise<Deck> {
    return apiClient.get(`/decks/${encodeURIComponent(slug)}`)
  },

  createDeck(input: DeckInput): Promise<CreateDeckResult> {
    return apiClient.post('/decks', input)
  },

  updateDeck(slug: string, input: Partial<DeckInput>): Promise<CreateDeckResult> {
    return apiClient.patch(`/decks/${encodeURIComponent(slug)}`, input)
  },

  publishDeck(slug: string): Promise<CreateDeckResult> {
    return apiClient.post(`/decks/${encodeURIComponent(slug)}/publish`)
  },

  deleteDeck(slug: string): Promise<{ id: string; deleted: true }> {
    return apiClient.delete(`/decks/${encodeURIComponent(slug)}`)
  },

  copyDeck(slug: string): Promise<CreateDeckResult> {
    return apiClient.post(`/decks/${encodeURIComponent(slug)}/copy`)
  }
}
