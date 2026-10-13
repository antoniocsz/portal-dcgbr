// Path: packages/modules/tournaments/src/use-cases/list-tournaments.ts
// Agenda paginada. Público: aceita published ou finished quando pedido; qualquer
// outro valor (incl. cancelled/ausente) cai no default published — cancelados
// nunca vazam ao público. Admin/Editor: filtram por qualquer status.
// `mine`: lista os torneios do próprio ator (qualquer status) — /me/tournaments.
import type { PaginatedResult } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import { isManager, type Actor } from '../domain/actor'
import type { Tournament } from '../domain/entities/tournament'
import type {
  ListTournamentsParams,
  TournamentRepository
} from '../domain/repositories/tournament-repository'
import { listTournamentsSchema, type ListTournamentsInput } from './schemas'

export interface ListTournamentsCommand {
  input: ListTournamentsInput
  actor?: Actor | null
  mine?: boolean
}

export class ListTournamentsUseCase {
  constructor(private readonly repo: TournamentRepository) {}

  async execute(command: ListTournamentsCommand): Promise<PaginatedResult<Tournament>> {
    const parsed = listTournamentsSchema.parse(command.input)

    const params: ListTournamentsParams = {
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 20
    }
    if (parsed.format) params.format = parsed.format
    if (parsed.location) params.location = parsed.location
    if (parsed.from) params.from = parsed.from

    if (command.mine) {
      if (!command.actor) throw new UnauthorizedError('Não autenticado')
      params.organizerId = command.actor.id
      if (parsed.status) params.status = parsed.status
    } else {
      const editorial = isManager(command.actor ?? null)
      if (editorial) {
        params.status = parsed.status ?? 'published'
      } else {
        params.status =
          parsed.status === 'finished' || parsed.status === 'published' ? parsed.status : 'published'
      }
    }

    return this.repo.list(params)
  }
}
