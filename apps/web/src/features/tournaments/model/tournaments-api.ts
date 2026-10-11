// Path: apps/web/src/features/tournaments/model/tournaments-api.ts
// Repository da feature: chamadas à API separada (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import { apiClient } from '@/lib/api-base'
import type {
  CreateTournamentResult,
  ListTournamentsParams,
  Paginated,
  Tournament,
  TournamentInput,
  TournamentResultInput,
  TournamentSummary
} from './types'

export { ApiError } from '@digimon/api-client'

function buildQuery(params: ListTournamentsParams): string {
  const search = new URLSearchParams()
  if (params.format) search.set('format', params.format)
  if (params.location) search.set('location', params.location)
  if (params.status) search.set('status', params.status)
  if (params.from) search.set('from', params.from)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  if (params.mine) search.set('mine', 'true')
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const tournamentsApi = {
  listTournaments(params: ListTournamentsParams = {}): Promise<Paginated<TournamentSummary>> {
    return apiClient.get(`/tournaments${buildQuery(params)}`)
  },

  getTournament(slug: string): Promise<Tournament> {
    return apiClient.get(`/tournaments/${encodeURIComponent(slug)}`)
  },

  createTournament(input: TournamentInput): Promise<CreateTournamentResult> {
    return apiClient.post('/tournaments', input)
  },

  updateTournament(
    slug: string,
    input: Partial<TournamentInput>
  ): Promise<CreateTournamentResult> {
    return apiClient.patch(`/tournaments/${encodeURIComponent(slug)}`, input)
  },

  cancelTournament(slug: string): Promise<{ id: string; status: 'cancelled' }> {
    return apiClient.delete(`/tournaments/${encodeURIComponent(slug)}`)
  },

  addResults(
    slug: string,
    input: TournamentResultInput
  ): Promise<{ id: string; status: 'finished' }> {
    return apiClient.post(`/tournaments/${encodeURIComponent(slug)}/results`, input)
  }
}
