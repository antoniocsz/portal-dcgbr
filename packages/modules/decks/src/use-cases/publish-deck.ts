// Path: packages/modules/decks/src/use-cases/publish-deck.ts
// Publica deck direto (sem revisão) — dono. Publicar exige ao menos uma carta.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireOwner, type Actor } from '../domain/actor'
import { deckEvent } from '../domain/events/deck-events'
import type { DeckRepository } from '../domain/repositories/deck-repository'

export interface PublishDeckCommand {
  actor: Actor
  slug: string
}

export class PublishDeckUseCase {
  constructor(
    private readonly repo: DeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: PublishDeckCommand): Promise<{ id: string; slug: string }> {
    const deck = await this.repo.findBySlug(command.slug)
    if (!deck) throw new NotFoundError('Deck não encontrado')

    requireOwner(command.actor, deck.ownerId)

    deck.publish()
    await this.repo.update(deck)
    await this.eventBus.publish(deckEvent('deck.published', deck))

    return { id: deck.id, slug: deck.slug }
  }
}
