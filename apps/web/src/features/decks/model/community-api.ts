// Path: apps/web/src/features/decks/model/community-api.ts
// Repository da comunidade de decks: chamadas às rotas /decks/community* da API
// separada (ADR-007) via @digimon/api-client. Sem hooks, sem JSX — camada Model.
import { ApiError } from '@digimon/api-client'
import { apiBaseUrl, apiClient } from '@/lib/api-base'
import type { DeckCardEntry } from './types'
import type {
  CommunityDeck,
  CommunityDeckPage,
  CommunityLikeResult,
  CommunityPublication,
  CommunityPublishResult,
  DeckLegalityResult,
  DeckListParseResult,
  ListCommunityDecksParams,
  ReportCommunityDeckInput
} from './community-types'

export { ApiError } from '@digimon/api-client'

function buildQuery(params: ListCommunityDecksParams): string {
  const search = new URLSearchParams()
  if (params.sort) search.set('sort', params.sort)
  if (params.period) search.set('period', params.period)
  if (params.colors && params.colors.length > 0) search.set('colors', params.colors.join(','))
  if (params.search) search.set('q', params.search)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export interface DeckLegalityInput {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
}

export const communityDecksApi = {
  list(params: ListCommunityDecksParams = {}): Promise<CommunityDeckPage> {
    return apiClient.get(`/decks/community${buildQuery(params)}`)
  },

  get(id: string): Promise<CommunityDeck> {
    return apiClient.get(`/decks/community/${encodeURIComponent(id)}`)
  },

  listPublications(): Promise<CommunityPublication[]> {
    return apiClient.get('/decks/community/publications')
  },

  publish(slug: string): Promise<CommunityPublishResult> {
    return apiClient.request(`/decks/community/publications/${encodeURIComponent(slug)}`, {
      method: 'PUT'
    })
  },

  unpublish(slug: string): Promise<void> {
    return apiClient.request(`/decks/community/publications/${encodeURIComponent(slug)}`, {
      method: 'DELETE'
    })
  },

  like(id: string): Promise<CommunityLikeResult> {
    return apiClient.request(`/decks/community/${encodeURIComponent(id)}/like`, {
      method: 'PUT'
    })
  },

  unlike(id: string): Promise<CommunityLikeResult> {
    return apiClient.request(`/decks/community/${encodeURIComponent(id)}/like`, {
      method: 'DELETE'
    })
  },

  recordCopy(id: string): Promise<void> {
    return apiClient.post(`/decks/community/${encodeURIComponent(id)}/copies`)
  },

  report(id: string, input: ReportCommunityDeckInput): Promise<void> {
    return apiClient.post(`/decks/community/${encodeURIComponent(id)}/reports`, input)
  },

  checkLegality(input: DeckLegalityInput): Promise<DeckLegalityResult> {
    return apiClient.post('/decks/legality', input)
  },

  importDeckList(text: string): Promise<DeckListParseResult> {
    return apiClient.post('/decks/import', { text })
  },

  // A rota responde text/plain; o client JSON não serve — fetch cru na base.
  async exportDeckList(slug: string): Promise<string> {
    const response = await fetch(`${apiBaseUrl}/decks/${encodeURIComponent(slug)}/export`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new ApiError('Não foi possível exportar o deck', response.status, 'EXPORT_ERROR')
    }
    return response.text()
  }
}
