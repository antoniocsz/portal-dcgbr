// Path: packages/modules/tournaments/src/use-cases/create-tournament.ts
// Member/Editor/Admin cria torneio e PUBLICA DIRETO (colaborativo, sem revisão).
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ConflictError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Tournament, slugify } from '../domain/entities/tournament'
import { tournamentEvent } from '../domain/events/tournament-events'
import type { TournamentRepository } from '../domain/repositories/tournament-repository'
import { createTournamentSchema, type CreateTournamentInput } from './schemas'

export interface CreateTournamentCommand {
  actor: Actor
  input: CreateTournamentInput
}

export class CreateTournamentUseCase {
  constructor(
    private readonly repo: TournamentRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateTournamentCommand): Promise<{ id: string; slug: string }> {
    const parsed = createTournamentSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do torneio', parsed.error.flatten())
    }

    const { name, format, location } = parsed.data
    const slug = parsed.data.slug ?? slugify(name)

    const existing = await this.repo.findBySlug(slug)
    if (existing) throw new ConflictError(`Já existe um torneio com o slug "${slug}"`)

    const tournament = Tournament.create({
      id: randomUUID(),
      slug,
      name,
      organizerId: command.actor.id,
      description: parsed.data.description ?? null,
      format,
      location,
      dateStart: parsed.data.dateStart,
      dateEnd: parsed.data.dateEnd ?? null
    })

    await this.repo.create(tournament.data)
    await this.eventBus.publish(tournamentEvent('tournament.created', tournament))

    return { id: tournament.id, slug: tournament.slug }
  }
}
