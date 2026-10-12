// Path: packages/modules/decks/src/use-cases/publish-deck.ts
// Publica deck direto (sem revisão) — dono. Publicar exige que o deck seja
// LEGAL (main 50 / egg ≤5 / limite de cópias / zonas / cartas existentes) e
// tenha ao menos uma carta. A legalidade é delegada ao CheckDeckLegalityUseCase.
import type { EventBus } from '@digimon/contracts'
import { NotFoundError, ValidationError } from '@digimon/contracts'
import { requireOwner, type Actor } from '../domain/actor'
import { deckEvent } from '../domain/events/deck-events'
import type { DeckRepository } from '../domain/repositories/deck-repository'
import { CheckDeckLegalityUseCase } from './check-deck-legality'

export interface PublishDeckCommand {
  actor: Actor
  slug: string
}

export class PublishDeckUseCase {
  constructor(
    private readonly repo: DeckRepository,
    private readonly legality: CheckDeckLegalityUseCase,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: PublishDeckCommand): Promise<{ id: string; slug: string }> {
    const deck = await this.repo.findBySlug(command.slug)
    if (!deck) throw new NotFoundError('Deck não encontrado')

    requireOwner(command.actor, deck.ownerId)

    const legality = await this.legality.execute({
      cardList: deck.data.cardList,
      eggList: deck.data.eggList
    })
    if (!legality.legal) {
      throw new ValidationError(
        'Deck ilegal — corrija as violações antes de publicar',
        legality.violations
      )
    }

    deck.publish()
    await this.repo.update(deck)
    await this.eventBus.publish(deckEvent('deck.published', deck))

    return { id: deck.id, slug: deck.slug }
  }
}
