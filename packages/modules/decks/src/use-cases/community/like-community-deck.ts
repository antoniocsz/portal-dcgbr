// Path: packages/modules/decks/src/use-cases/community/like-community-deck.ts
// Curtir uma publicação. O autor não curte o próprio deck; 1 curtida por conta
// (idempotente); contador atualizado na mesma transação (repo.like).
import type { EventBus } from '@digimon/contracts'
import { ForbiddenError, NotFoundError } from '@digimon/contracts'
import type { Actor } from '../../domain/actor'
import { deckPublicationEvent } from '../../domain/events/deck-events'
import type { PublicDeckRepository } from '../../domain/repositories/public-deck-repository'

export interface LikeCommunityDeckCommand {
  actor: Actor
  publicDeckId: string
}

export interface LikeCommunityDeckResult {
  likeCount: number
  liked: boolean
}

export class LikeCommunityDeckUseCase {
  constructor(
    private readonly publicDecks: PublicDeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: LikeCommunityDeckCommand): Promise<LikeCommunityDeckResult> {
    const record = await this.publicDecks.findById(command.publicDeckId)
    if (!record) throw new NotFoundError('Publicação não encontrada')
    if (record.deck.accountId === command.actor.id) {
      throw new ForbiddenError('Você não pode curtir o próprio deck')
    }

    const { created, likeCount } = await this.publicDecks.like(
      command.publicDeckId,
      command.actor.id
    )
    if (created) {
      await this.eventBus.publish(
        deckPublicationEvent('deck.publication.liked', record.deck)
      )
    }
    return { likeCount, liked: true }
  }
}
