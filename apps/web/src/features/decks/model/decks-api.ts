// Path: apps/web/src/features/decks/model/decks-api.ts
// Repository da feature: chamadas fetch para a API /api/decks.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import type {
  CreateDeckResult,
  Deck,
  DeckInput,
  DeckSummary,
  ListDecksParams,
  Paginated
} from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  })
  if (!response.ok) {
    let message = 'Erro inesperado'
    let code = 'INTERNAL_ERROR'
    try {
      const body = (await response.json()) as { error?: { message?: string; code?: string } }
      if (body.error?.message) message = body.error.message
      if (body.error?.code) code = body.error.code
    } catch {
      // corpo não-JSON: mantém mensagem padrão
    }
    throw new ApiError(message, response.status, code)
  }
  return (await response.json()) as T
}

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
    return request(`/api/decks${buildQuery(params)}`)
  },

  getDeck(slug: string): Promise<Deck> {
    return request(`/api/decks/${encodeURIComponent(slug)}`)
  },

  createDeck(input: DeckInput): Promise<CreateDeckResult> {
    return request('/api/decks', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  updateDeck(slug: string, input: Partial<DeckInput>): Promise<CreateDeckResult> {
    return request(`/api/decks/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  publishDeck(slug: string): Promise<CreateDeckResult> {
    return request(`/api/decks/${encodeURIComponent(slug)}/publish`, { method: 'POST' })
  },

  deleteDeck(slug: string): Promise<{ id: string; deleted: true }> {
    return request(`/api/decks/${encodeURIComponent(slug)}`, { method: 'DELETE' })
  },

  copyDeck(slug: string): Promise<CreateDeckResult> {
    return request(`/api/decks/${encodeURIComponent(slug)}/copy`, { method: 'POST' })
  }
}
