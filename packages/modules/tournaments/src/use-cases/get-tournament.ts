// Path: packages/modules/tournaments/src/use-cases/get-tournament.ts
// Leitura por slug. Público: published e finished. Cancelados só para o criador
// ou Admin/Editor (NotFound para o público — sem vazar existência).
import { NotFoundError } from '@digimon/contracts'
import { canManage, type Actor } from '../domain/actor'
import type { Tournament } from '../domain/entities/tournament'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'

export interface GetTournamentCommand {
  slug: string
  actor?: Actor | null
}

export class GetTournamentUseCase {
  constructor(private readonly repo: TournamentRepository) {}

  async execute(command: GetTournamentCommand): Promise<Tournament> {
    const tournament = await this.repo.findBySlug(command.slug)
    if (!tournament) throw new NotFoundError('Torneio não encontrado')

    const actor = command.actor ?? null
    const canSee =
      tournament.isPublic || (actor !== null && canManage(actor, tournament.organizerId))
    if (!canSee) throw new NotFoundError('Torneio não encontrado')

    return tournament
  }
}
