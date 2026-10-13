// Path: packages/modules/privacy/src/domain/repositories/consent-record-repository.ts
// Interface do repositório de consentimento — implementações: Prisma (infra) e
// in-memory (testes). Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { PaginatedResult } from '@digimon/contracts'
import type { ConsentRecord, ConsentRecordData } from '../entities/consent-record'

export interface ListConsentRecordsParams {
  page?: number
  pageSize?: number
}

export interface ConsentRecordRepository {
  create(data: ConsentRecordData): Promise<void>
  list(params: ListConsentRecordsParams): Promise<PaginatedResult<ConsentRecord>>
}
