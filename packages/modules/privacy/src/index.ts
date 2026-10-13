// Barrel público do módulo @digimon/privacy — única porta de entrada do pacote.
// Exporta somente o público. Nunca imports internos de outros módulos (ESLint boundaries).

// Domínio
export { CONSENT_AUDIT_ROLES, QUEUE_ROLES, isQueueManager, requireConsentAuditor, requireQueueManager } from './domain/actor'
export type { Actor } from './domain/actor'
export { ConsentRecord, DEFAULT_POLICY_VERSION, MAX_USER_AGENT_LENGTH } from './domain/entities/consent-record'
export type { ConsentRecordData, CreateConsentRecordData } from './domain/entities/consent-record'
export { DataRequest } from './domain/entities/data-request'
export type {
  CreateDataRequestData,
  DataRequestData,
  DataRequestStatus,
  DataRequestType
} from './domain/entities/data-request'
export {
  consentRecordedEvent,
  dataRequestCreatedEvent,
  dataRequestUpdatedEvent
} from './domain/events/privacy-events'
export type { PrivacyEvent, PrivacyEventType } from './domain/events/privacy-events'
export type { ConsentRecordRepository, ListConsentRecordsParams } from './domain/repositories/consent-record-repository'
export type { DataRequestRepository, ListDataRequestsParams } from './domain/repositories/data-request-repository'

// Use cases
export { RecordConsentUseCase } from './use-cases/record-consent'
export type { RecordConsentCommand } from './use-cases/record-consent'
export { ListConsentRecordsUseCase } from './use-cases/list-consent-records'
export type { ListConsentRecordsCommand } from './use-cases/list-consent-records'
export { CreateDataRequestUseCase } from './use-cases/create-data-request'
export type { CreateDataRequestCommand } from './use-cases/create-data-request'
export { ListDataRequestsUseCase } from './use-cases/list-data-requests'
export type { ListDataRequestsCommand } from './use-cases/list-data-requests'
export { UpdateDataRequestStatusUseCase } from './use-cases/update-data-request-status'
export type { UpdateDataRequestStatusCommand } from './use-cases/update-data-request-status'

// Schemas de entrada (usados pelas rotas do apps/api)
export {
  createDataRequestSchema,
  dataRequestStatusSchema,
  dataRequestTypeSchema,
  listConsentRecordsSchema,
  listDataRequestsSchema,
  recordConsentSchema,
  updateDataRequestStatusSchema
} from './use-cases/schemas'
export type {
  CreateDataRequestInput,
  ListConsentRecordsInput,
  ListDataRequestsInput,
  RecordConsentInput,
  UpdateDataRequestStatusInput
} from './use-cases/schemas'

// Infra
export { PrismaConsentRecordRepository } from './infra/repositories/prisma-consent-record-repository'
export { PrismaDataRequestRepository } from './infra/repositories/prisma-data-request-repository'
