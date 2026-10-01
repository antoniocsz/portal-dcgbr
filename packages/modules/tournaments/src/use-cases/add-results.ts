// Path: packages/modules/tournaments/src/use-cases/add-results.ts
// Registra resultados (posições/jogadores) e finaliza o torneio.
// Somente criador OU Admin/Editor.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError, ValidationError } from '@digimon/contracts'
import { requireCanManage, type Actor } from '../domain/actor'
import type { TournamentResultEntry } from '../domain/entities/tournament'
import { tournamentEvent } from '../domain/events/tournament-events'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'
import { addResultsSchema, type AddResultsInput } from './schemas'

export interface AddResultsCommand {
  actor: Actor
  slug: string
  input: AddResultsInput
}

export class AddResultsUseCase {
  constructor(
    private readonly repo: TournamentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: AddResultsCommand): Promise<{ id: string; status: 'finished' }> {
    const parsed = addResultsSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Resultados inválidos', parsed.error.flatten())
    }

    const tournament = await this.repo.findBySlug(command.slug)
    if (!tournament) throw new NotFoundError('Torneio não encontrado')

    requireCanManage(command.actor, tournament.organizerId)

    const results: TournamentResultEntry[] = parsed.data.results.map((entry) => ({
      position: entry.position,
      player: entry.player,
      deck: entry.deck ?? null,
      record: entry.record ?? null
    }))

    tournament.addResults(results)
    await this.repo.update(tournament)
    await this.eventBus.publish(tournamentEvent('tournament.results.added', tournament))

    return { id: tournament.id, status: 'finished' }
  }
}
