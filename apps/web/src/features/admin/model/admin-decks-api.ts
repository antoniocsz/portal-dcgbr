// Path: apps/web/src/features/admin/model/admin-decks-api.ts
// Repository admin de decks: rotas admin dedicadas — GET /admin/decks
// (agenda COMPLETA: rascunhos + published + unlisted, com filtro de status,
// busca e paginação) e DELETE /admin/decks/:slug (exclusão de qualquer
// deck — override de dono validado no backend, administrator-only na rota).
// Via @digimon/api-client (ADR-007). Sem hooks, sem JSX — camada Model.
import { apiClient } from '@/lib/api-base'
import type { DeckStatus, DeckSummary, Paginated } from '@/features/decks/model/types'

export { ApiError } from '@digimon/api-client'

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
    return apiClient.get(`/admin/decks${buildQuery(params)}`)
  },

  deleteDeck(slug: string): Promise<{ id: string; deleted: true }> {
    return apiClient.delete(`/admin/decks/${encodeURIComponent(slug)}`)
  }
}
