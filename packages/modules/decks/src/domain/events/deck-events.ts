// Path: packages/modules/decks/src/domain/events/deck-events.ts
// Eventos que o módulo decks publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Deck } from '../entities/deck'
import type { PublicDeck } from '../entities/public-deck'

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

// Eventos da comunidade de decks (snapshot PublicDeck). Adicionados sem quebrar
// os eventos de deck acima.
export type DeckPublicationEventType =
  | 'deck.publication.published'
  | 'deck.publication.unpublished'
  | 'deck.publication.liked'

export interface DeckPublicationEvent extends DomainEvent {
  type: DeckPublicationEventType
  publicDeckId: string
  sourceDeckId: string
  accountId: string
}

export function deckPublicationEvent(
  type: DeckPublicationEventType,
  publication: PublicDeck
): DeckPublicationEvent {
  return {
    type,
    occurredAt: new Date(),
    publicDeckId: publication.id,
    sourceDeckId: publication.sourceDeckId,
    accountId: publication.accountId
  }
}
