// Path: packages/modules/decks/src/use-cases/community/unpublish-deck-from-community.ts
// Despublica a publicação do próprio autor: status → `unpublished`. As curtidas
// e cópias são preservadas (apenas sai do feed público).
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { CommunityDeckStatus } from '../../domain/community/community-types'
import { deckPublicationEvent } from '../../domain/events/deck-events'
import type { DeckRepository } from '../../domain/repositories/deck-repository'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface UnpublishDeckFromCommunityCommand {
  actor: Actor
  slug: string
}

export interface UnpublishDeckFromCommunityResult {
  id: string
  status: CommunityDeckStatus
}

export class UnpublishDeckFromCommunityUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly publicDecks: PublicDeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: UnpublishDeckFromCommunityCommand
  ): Promise<UnpublishDeckFromCommunityResult> {
    const deck = await this.decks.findBySlug(command.slug)
    if (!deck || deck.ownerId !== command.actor.id) {
      throw new NotFoundError('Deck não encontrado')
    }

    const publication = await this.publicDecks.findBySourceDeck(command.actor.id, deck.id)
    if (!publication) throw new NotFoundError('Publicação não encontrada')

    await this.publicDecks.unpublish(publication.id)
    await this.eventBus.publish(
      deckPublicationEvent('deck.publication.unpublished', publication)
    )
    return { id: publication.id, status: 'unpublished' }
  }
}
