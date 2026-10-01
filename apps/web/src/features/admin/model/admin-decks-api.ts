// Path: apps/web/src/features/admin/model/admin-decks-api.ts
// Repository admin de decks: rotas admin dedicadas — GET /api/admin/decks
// (agenda COMPLETA: rascunhos + published + unlisted, com filtro de status,
// busca e paginação) e DELETE /api/admin/decks/:slug (exclusão de qualquer
// deck — override de dono validado no backend, administrator-only na rota).
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import type { DeckStatus, DeckSummary, Paginated } from '@/features/decks/model/types'

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

export interface AdminDecksListParams {
  search?: string
  format?: string
  status?: DeckStatus
  page?: number
  pageSize?: number
}

function buildQuery(params: AdminDecksListParams): string {
  const search = new URLSearchParams()
  if (params.search) search.set('search', params.search)
  if (params.format) search.set('format', params.format)
  if (params.status) search.set('status', params.status)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adminDecksApi = {
  list(params: AdminDecksListParams = {}): Promise<Paginated<DeckSummary>> {
    return request(`/api/admin/decks${buildQuery(params)}`)
  },

  deleteDeck(slug: string): Promise<{ id: string; deleted: true }> {
    return request(`/api/admin/decks/${encodeURIComponent(slug)}`, { method: 'DELETE' })
  }
}
