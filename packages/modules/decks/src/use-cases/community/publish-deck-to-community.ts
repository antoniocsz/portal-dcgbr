// Path: packages/modules/decks/src/use-cases/community/publish-deck-to-community.ts
// Publica o deck SALVO (nunca dados do request) na comunidade. Fluxo: lê o deck
// do repositório, valida legalidade, revisa o nome e cria/atualiza o snapshot
// PublicDeck (status `public`). Delega legalidade ao CheckDeckLegalityUseCase.
import type { EventBus } from '@digimon/contracts'
import { ConflictError, NotFoundError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import type { CommunityDeckStatus } from '../../domain/community/community-types'
import { dominantColors, type DeckColorResolver } from '../../domain/community/community-colors'
import { reviewDeckName } from '../../domain/community/deck-name-moderation'
import { PublicDeck } from '../../domain/entities/public-deck'
import { deckPublicationEvent } from '../../domain/events/deck-events'
import type { DeckRepository } from '../../domain/repositories/deck-repository'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'
import { CheckDeckLegalityUseCase } from '../check-deck-legality'

export interface PublishDeckToCommunityCommand {
  actor: Actor
  slug: string
}

export interface PublishDeckToCommunityResult {
  id: string
  sourceDeckId: string
  status: CommunityDeckStatus
}

export class PublishDeckToCommunityUseCase {
  constructor(
    private readonly decks: DeckRepository,
    private readonly publicDecks: PublicDeckRepository,
    private readonly legality: CheckDeckLegalityUseCase,
    private readonly colors: DeckColorResolver,
    private readonly eventBus: EventBus
  ) {}

  async execute(
    command: PublishDeckToCommunityCommand
  ): Promise<PublishDeckToCommunityResult> {
    const deck = await this.decks.findBySlug(command.slug)
    // Deck inexistente ou de outro dono → mesmo erro (não vaza existência).
    if (!deck || deck.ownerId !== command.actor.id) {
      throw new NotFoundError('Deck não encontrado')
    }

    const legality = await this.legality.execute({
      cardList: deck.data.cardList,
      eggList: deck.data.eggList
    })
    if (!legality.legal) {
      throw new ValidationError(
        'Deck ilegal — corrija as violações antes de publicar na comunidade',
        legality.violations
      )
    }

    const review = reviewDeckName(deck.data.name)
    if (!review.allowed) {
      throw new ValidationError('Nome do deck não permitido na comunidade')
    }

    const cardColors = await this.colors.resolveColors(deck.data.cardList)
    const colors = dominantColors(deck.data.cardList, cardColors)

    const existing = await this.publicDecks.findBySourceDeck(command.actor.id, deck.id)
    if (existing) {
      if (existing.status === 'hidden') {
        throw new ConflictError('Publicação oculta pela moderação')
      }
      existing.refresh({
        name: review.name,
        colors,
        cardList: deck.data.cardList,
        eggList: deck.data.eggList,
        coverCardId: deck.data.coverCardId
      })
      await this.publicDecks.update(existing)
      await this.eventBus.publish(
        deckPublicationEvent('deck.publication.published', existing)
      )
      return { id: existing.id, sourceDeckId: existing.sourceDeckId, status: existing.status }
    }

    const publication = PublicDeck.fromSource(deck, command.actor.id, {
      name: review.name,
      colors,
      legal: legality.legal
    })
    await this.publicDecks.create(publication.data)
    await this.eventBus.publish(
      deckPublicationEvent('deck.publication.published', publication)
    )
    return {
      id: publication.id,
      sourceDeckId: publication.sourceDeckId,
      status: publication.status
    }
  }
}
