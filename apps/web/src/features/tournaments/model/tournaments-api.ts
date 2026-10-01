// Path: apps/web/src/features/tournaments/model/tournaments-api.ts
// Repository da feature: chamadas fetch para a API /api/tournaments.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import type {
  CreateTournamentResult,
  ListTournamentsParams,
  Paginated,
  Tournament,
  TournamentInput,
  TournamentResultInput,
  TournamentSummary
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
    return request(`/api/tournaments${buildQuery(params)}`)
  },

  getTournament(slug: string): Promise<Tournament> {
    return request(`/api/tournaments/${encodeURIComponent(slug)}`)
  },

  createTournament(input: TournamentInput): Promise<CreateTournamentResult> {
    return request('/api/tournaments', {
      method: 'POST',
      body: JSON.stringify(input)
    })
  },

  updateTournament(
    slug: string,
    input: Partial<TournamentInput>
  ): Promise<CreateTournamentResult> {
    return request(`/api/tournaments/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    })
  },

  cancelTournament(slug: string): Promise<{ id: string; status: 'cancelled' }> {
    return request(`/api/tournaments/${encodeURIComponent(slug)}`, { method: 'DELETE' })
  },

  addResults(
    slug: string,
    input: TournamentResultInput
  ): Promise<{ id: string; status: 'finished' }> {
    return request(`/api/tournaments/${encodeURIComponent(slug)}/results`, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  }
}
