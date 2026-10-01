// Path: packages/modules/tournaments/src/use-cases/update-tournament.ts
// Edita torneio. Criador OU Admin/Editor. Torneios cancelados não são editáveis.
import type { EventBus } from '@digimon/contracts'
import { ConflictError, NotFoundError, ValidationError } from '@digimon/contracts'
import { requireCanManage, type Actor } from '../domain/actor'
import type { UpdateTournamentData } from '../domain/entities/tournament'
import { tournamentEvent } from '../domain/events/tournament-events'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'
import { updateTournamentSchema, type UpdateTournamentInput } from './schemas'

export interface UpdateTournamentCommand {
  actor: Actor
  slug: string
  input: UpdateTournamentInput
}

export class UpdateTournamentUseCase {
  constructor(
    private readonly repo: TournamentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateTournamentCommand): Promise<{ id: string; slug: string }> {
    const parsed = updateTournamentSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do torneio', parsed.error.flatten())
    }

    const tournament = await this.repo.findBySlug(command.slug)
    if (!tournament) throw new NotFoundError('Torneio não encontrado')

    requireCanManage(command.actor, tournament.organizerId)

    if (parsed.data.slug !== undefined && parsed.data.slug !== tournament.slug) {
      const clash = await this.repo.findBySlug(parsed.data.slug)
      if (clash && clash.id !== tournament.id) {
        throw new ConflictError(`Já existe um torneio com o slug "${parsed.data.slug}"`)
      }
    }

    const patch: UpdateTournamentData = {}
    if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.description !== undefined) patch.description = parsed.data.description
    if (parsed.data.format !== undefined) patch.format = parsed.data.format
    if (parsed.data.location !== undefined) patch.location = parsed.data.location
    if (parsed.data.dateStart !== undefined) patch.dateStart = parsed.data.dateStart
    if (parsed.data.dateEnd !== undefined) patch.dateEnd = parsed.data.dateEnd

    tournament.update(patch)
    await this.repo.update(tournament)
    await this.eventBus.publish(tournamentEvent('tournament.updated', tournament))

    return { id: tournament.id, slug: tournament.slug }
  }
}
