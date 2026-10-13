// Path: packages/modules/privacy/src/domain/repositories/data-request-repository.ts
// Interface do repositório de solicitações do titular — implementações: Prisma
// (infra) e in-memory (testes). Não multi-tenant (ADR-004).
import type { PaginatedResult } from '@digimon/contracts'
import type { DataRequest, DataRequestData, DataRequestStatus } from '../entities/data-request'

export interface ListDataRequestsParams {
  status?: DataRequestStatus
  page?: number
  pageSize?: number
}

export interface DataRequestRepository {
  create(data: DataRequestData): Promise<void>
  findById(id: string): Promise<DataRequest | null>
  list(params: ListDataRequestsParams): Promise<PaginatedResult<DataRequest>>
  updateStatus(id: string, status: DataRequestStatus, updatedAt: Date): Promise<void>
}
