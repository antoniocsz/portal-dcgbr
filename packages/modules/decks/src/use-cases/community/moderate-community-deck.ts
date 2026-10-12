// Path: packages/modules/decks/src/use-cases/community/moderate-community-deck.ts
// Moderação de publicação (administrator|editor). `hide` remove do feed e fecha
// os reportes abertos; `restore` volta a publicação para o feed.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireManager, type Actor } from '../../domain/actor'
import type {
  CommunityDeckStatus,
  CommunityModerationAction
} from '../../domain/community/community-types'
import { deckPublicationEvent } from '../../domain/events/deck-events'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface ModerateCommunityDeckCommand {
  actor: Actor
  publicDeckId: string
  action: CommunityModerationAction
}

export interface ModerateCommunityDeckResult {
  id: string
  status: CommunityDeckStatus
}

export class ModerateCommunityDeckUseCase {
  constructor(
    private readonly publicDecks: PublicDeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: ModerateCommunityDeckCommand
  ): Promise<ModerateCommunityDeckResult> {
    requireManager(command.actor)

    const record = await this.publicDecks.findById(command.publicDeckId)
    if (!record) throw new NotFoundError('Publicação não encontrada')

    const status: CommunityDeckStatus = command.action === 'hide' ? 'hidden' : 'public'
    await this.publicDecks.setStatus(command.publicDeckId, status)
    if (command.action === 'hide') {
      await this.publicDecks.dismissReports(command.publicDeckId)
    }
    await this.eventBus.publish(
      deckPublicationEvent('deck.publication.moderated', record.deck)
    )
    return { id: record.deck.id, status }
  }
}
