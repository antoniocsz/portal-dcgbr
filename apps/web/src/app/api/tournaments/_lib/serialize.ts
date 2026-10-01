// Path: apps/web/src/app/api/tournaments/_lib/serialize.ts
// Serialização dos agregados de torneio para JSON (Dates → ISO strings).
// Listagens usam o resumo (sem results/description) para manter a resposta leve.
import type { PaginatedResult } from '@digimon/contracts'
import type { Tournament, TournamentResultEntry } from '@digimon/tournaments'

export interface TournamentDTO {
  id: string
  slug: string
  name: string
  organizerId: string
  description: string | null
  format: string
  location: string
  dateStart: string
  dateEnd: string | null
  status: string
  results: TournamentResultEntry[] | null
  createdAt: string
  updatedAt: string
}

export interface TournamentSummaryDTO {
  id: string
  slug: string
  name: string
  format: string
  location: string
  dateStart: string
  status: string
  organizerId: string
}

export function serializeTournament(tournament: Tournament): TournamentDTO {
  const d = tournament.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    organizerId: d.organizerId,
    description: d.description,
    format: d.format,
    location: d.location,
    dateStart: d.dateStart.toISOString(),
    dateEnd: d.dateEnd?.toISOString() ?? null,
    status: d.status,
    results: d.results,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

export function serializeSummary(tournament: Tournament): TournamentSummaryDTO {
  const d = tournament.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    format: d.format,
    location: d.location,
    dateStart: d.dateStart.toISOString(),
    status: d.status,
    organizerId: d.organizerId
  }
}

export function serializeList(
  result: PaginatedResult<Tournament>
): PaginatedResult<TournamentSummaryDTO> {
  return {
    items: result.items.map(serializeSummary),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}
