// Path: packages/modules/privacy/src/domain/events/privacy-events.ts
// Eventos que o módulo privacy publica via EventBus (@digimon/contracts).
import type { DomainEvent } from '@digimon/contracts'
import type { DataRequestStatus, DataRequestType } from '../entities/data-request'

export type PrivacyEventType =
  | 'consent.recorded'
  | 'privacy.request.created'
  | 'privacy.request.updated'

export interface PrivacyEvent extends DomainEvent {
  type: PrivacyEventType
  subjectKey?: string
  requestId?: string
  requestType?: DataRequestType
  status?: DataRequestStatus
}

export function consentRecordedEvent(subjectKey: string): PrivacyEvent {
  return { type: 'consent.recorded', occurredAt: new Date(), subjectKey }
}

export function dataRequestCreatedEvent(
  requestId: string,
  requestType: DataRequestType
): PrivacyEvent {
  return {
    type: 'privacy.request.created',
    occurredAt: new Date(),
    requestId,
    requestType
  }
}

export function dataRequestUpdatedEvent(
  requestId: string,
  status: DataRequestStatus
): PrivacyEvent {
  return {
    type: 'privacy.request.updated',
    occurredAt: new Date(),
    requestId,
    status
  }
}
