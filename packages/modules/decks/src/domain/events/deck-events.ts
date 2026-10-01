// Path: packages/modules/decks/src/domain/events/deck-events.ts
// Eventos que o módulo decks publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Deck } from '../entities/deck'

export type DeckEventType =
  | 'deck.created'
  | 'deck.updated'
  | 'deck.published'
  | 'deck.copied'

export interface DeckEvent extends DomainEvent {
  type: DeckEventType
  deckId: string
  slug: string
}

export function deckEvent(type: DeckEventType, deck: Deck): DeckEvent {
  return {
    type,
    occurredAt: new Date(),
    deckId: deck.id,
    slug: deck.slug
  }
}
