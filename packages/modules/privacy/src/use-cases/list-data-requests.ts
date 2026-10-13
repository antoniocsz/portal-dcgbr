// Path: packages/modules/privacy/src/use-cases/list-data-requests.ts
// Fila de solicitações do titular (administrator|editor), com filtro por status.
import type { PaginatedResult } from '@digimon/contracts'
import { requireQueueManager, type Actor } from '../domain/actor'
import type { DataRequest } from '../domain/entities/data-request'
import type {
  DataRequestRepository,
  ListDataRequestsParams
} from '../domain/repositories/data-request-repository'
import { listDataRequestsSchema, type ListDataRequestsInput } from './schemas'

export interface ListDataRequestsCommand {
  actor: Actor
  input?: ListDataRequestsInput
}

export class ListDataRequestsUseCase {
  constructor(private readonly repo: DataRequestRepository) {}

  async execute(command: ListDataRequestsCommand): Promise<PaginatedResult<DataRequest>> {
    requireQueueManager(command.actor)
    const parsed = listDataRequestsSchema.parse(command.input ?? {})

    const params: ListDataRequestsParams = {
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 20
    }
    if (parsed.status) params.status = parsed.status

    return this.repo.list(params)
  }
}
