// Path: packages/modules/cards/src/domain/events/card-events.ts
// Eventos que o módulo cards publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Card } from '../entities/card'

export type CardEventType = 'card.imported' | 'card.updated'

export interface CardEvent extends DomainEvent {
  type: CardEventType
  cardId: string
  dcgId: string
}

export function cardEvent(type: CardEventType, card: Card): CardEvent {
  return {
    type,
    occurredAt: new Date(),
    cardId: card.id,
    dcgId: card.dcgId
  }
}
