// Path: apps/web/src/features/tournaments/model/types.ts
// Tipos da feature tournaments (espelho dos DTOs da API /api/tournaments).
// Decisão: o frontend não importa @digimon/tournaments no client (evita arrastar
// @digimon/database para o bundle) — tipos literais mantidos em sync com o backend.
export type TournamentStatus = 'published' | 'cancelled' | 'finished'

export interface TournamentResultEntry {
  position: number
  player: string
  deck: string | null
  record: string | null
}

export interface TournamentSummary {
  id: string
  slug: string
  name: string
  format: string
  location: string
  dateStart: string
  status: TournamentStatus
  organizerId: string
}

export interface Tournament extends TournamentSummary {
  description: string | null
  dateEnd: string | null
  results: TournamentResultEntry[] | null
  createdAt: string
  updatedAt: string
}

export interface TournamentInput {
  name: string
  slug?: string
  description?: string | null
  format: string
  location: string
  dateStart: string
  dateEnd?: string | null
}

export interface TournamentResultInput {
  results: TournamentResultEntry[]
}

export interface CreateTournamentResult {
  id: string
  slug: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListTournamentsParams {
  format?: string
  location?: string
  status?: TournamentStatus
  from?: string
  page?: number
  pageSize?: number
  mine?: boolean
}

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  published: 'Publicado',
  cancelled: 'Cancelado',
  finished: 'Finalizado'
}
