// Path: apps/web/src/features/cards/model/cards-api.ts
// Repository da feature: chamadas fetch para a API /api/cards.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import type {
  Card,
  CardSet,
  ImportCardsInput,
  ImportCardsResult,
  ListCardsParams,
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

function buildQuery(params: ListCardsParams): string {
  const search = new URLSearchParams()
  if (params.search) search.set('search', params.search)
  if (params.type) search.set('type', params.type)
  if (params.color) search.set('color', params.color)
  if (params.playCost !== undefined) search.set('playCost', String(params.playCost))
  if (params.setCode) search.set('setCode', params.setCode)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const cardsApi = {
  listCards(params: ListCardsParams = {}): Promise<Paginated<Card>> {
    return request(`/api/cards${buildQuery(params)}`)
  },

  getCard(id: string): Promise<Card> {
    return request(`/api/cards/${encodeURIComponent(id)}`)
  },

  listSets(): Promise<{ items: CardSet[] }> {
    return request('/api/cards/sets')
  },

  importCards(input: ImportCardsInput): Promise<ImportCardsResult> {
    return request('/api/cards/admin/import', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  }
}
