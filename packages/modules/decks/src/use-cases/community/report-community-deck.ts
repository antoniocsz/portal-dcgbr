// Path: packages/modules/decks/src/use-cases/community/report-community-deck.ts
// Reporta uma publicação. O autor não reporta o próprio deck; 1 reporte aberto
// por conta/deck (um novo substitui o anterior — tratado no repo.report). Devolve
// o alvo (dono/nome) para a fila de moderação.
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { CommunityDeckReport } from '../../domain/community/community-types'
import { deckPublicationEvent } from '../../domain/events/deck-events'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'
import { reportCommunityDeckSchema, type ReportCommunityDeckInput } from './schemas'

export interface ReportCommunityDeckCommand {
  actor: Actor
  publicDeckId: string
  input: ReportCommunityDeckInput
}

export interface ReportedDeckTarget {
  publicDeckId: string
  name: string
  ownerId: string
  ownerName: string
}

export interface ReportCommunityDeckResult {
  report: CommunityDeckReport
  target: ReportedDeckTarget
}

export class ReportCommunityDeckUseCase {
  constructor(
    private readonly publicDecks: PublicDeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ReportCommunityDeckCommand): Promise<ReportCommunityDeckResult> {
    const parsed = reportCommunityDeckSchema.parse(command.input)
    const record = await this.publicDecks.findById(command.publicDeckId)
    if (!record) throw new NotFoundError('Publicação não encontrada')
    if (record.deck.accountId === command.actor.id) {
      throw new ForbiddenError('Você não pode reportar o próprio deck')
    }

    const report = await this.publicDecks.report({
      publicDeckId: command.publicDeckId,
      reporterAccountId: command.actor.id,
      reason: parsed.reason,
      details: parsed.details ?? null
    })
    await this.eventBus.publish(
      deckPublicationEvent('deck.publication.reported', record.deck)
    )

    return {
      report,
      target: {
        publicDeckId: record.deck.id,
        name: record.deck.data.name,
        ownerId: record.deck.accountId,
        ownerName: record.ownerName
      }
    }
  }
}
