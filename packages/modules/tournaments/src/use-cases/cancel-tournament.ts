// Path: packages/modules/tournaments/src/use-cases/cancel-tournament.ts
// Cancela torneio. Criador OU Admin/Editor.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireCanManage, type Actor } from '../domain/actor'
import { tournamentEvent } from '../domain/events/tournament-events'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'

export interface CancelTournamentCommand {
  actor: Actor
  slug: string
}

export class CancelTournamentUseCase {
  constructor(
    private readonly repo: TournamentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CancelTournamentCommand): Promise<{ id: string; status: 'cancelled' }> {
    const tournament = await this.repo.findBySlug(command.slug)
    if (!tournament) throw new NotFoundError('Torneio não encontrado')

    requireCanManage(command.actor, tournament.organizerId)

    tournament.cancel()
    await this.repo.update(tournament)
    await this.eventBus.publish(tournamentEvent('tournament.cancelled', tournament))

    return { id: tournament.id, status: 'cancelled' }
  }
}
