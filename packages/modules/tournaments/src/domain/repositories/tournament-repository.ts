// Path: packages/modules/tournaments/src/domain/repositories/tournament-repository.ts
// Interface do repositório de torneios — implementações: Prisma (infra) e in-memory (testes).
// Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { PaginatedResult } from '@digimon/contracts'
import type { Tournament, TournamentData, TournamentStatus } from '../entities/tournament'

export interface ListTournamentsParams {
  status?: TournamentStatus
  format?: string
  location?: string
  organizerId?: string
  from?: Date
  page?: number
  pageSize?: number
}

export interface TournamentRepository {
  create(data: TournamentData): Promise<void>
  update(tournament: Tournament): Promise<void>
  findById(id: string): Promise<Tournament | null>
  findBySlug(slug: string): Promise<Tournament | null>
  list(params: ListTournamentsParams): Promise<PaginatedResult<Tournament>>
}
