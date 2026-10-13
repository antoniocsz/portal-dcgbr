// Path: packages/modules/privacy/src/use-cases/list-consent-records.ts
// Lista/resumo dos registros de consentimento (auditoria). Somente administrator.
import type { PaginatedResult } from '@digimon/contracts'
import { requireConsentAuditor, type Actor } from '../domain/actor'
import type { ConsentRecord } from '../domain/entities/consent-record'
import type { ConsentRecordRepository } from '../domain/repositories/consent-record-repository'
import { listConsentRecordsSchema, type ListConsentRecordsInput } from './schemas'

export interface ListConsentRecordsCommand {
  actor: Actor
  input?: ListConsentRecordsInput
}

export class ListConsentRecordsUseCase {
  constructor(private readonly repo: ConsentRecordRepository) {}

  async execute(command: ListConsentRecordsCommand): Promise<PaginatedResult<ConsentRecord>> {
    requireConsentAuditor(command.actor)
    const parsed = listConsentRecordsSchema.parse(command.input ?? {})
    return this.repo.list({
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 50
    })
  }
}
