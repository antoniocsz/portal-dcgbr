// Path: packages/modules/ads/src/domain/events/ad-events.ts
// Eventos que o módulo ads publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { Ad, AdKind } from '../entities/ad'

export type AdEventType = 'ad.created' | 'ad.updated' | 'ad.deleted'

export interface AdEvent extends DomainEvent {
  type: AdEventType
  adId: string
  kind: AdKind
}

export function adEvent(type: AdEventType, ad: Ad): AdEvent {
  return {
    type,
    occurredAt: new Date(),
    adId: ad.id,
    kind: ad.kind
  }
}
