// Path: packages/modules/privacy/src/test/memory-repositories.ts
// Repositórios em memória para testes unitários — implementam as interfaces do
// domínio. Intercambiáveis com as implementações Prisma (Liskov) sem tocar nos
// use cases.
import type { PaginatedResult } from '@digimon/contracts'
import { ConsentRecord, type ConsentRecordData } from '../domain/entities/consent-record'
import { DataRequest, type DataRequestData, type DataRequestStatus } from '../domain/entities/data-request'
import type {
  ConsentRecordRepository,
  ListConsentRecordsParams
} from '../domain/repositories/consent-record-repository'
import type {
  DataRequestRepository,
  ListDataRequestsParams
} from '../domain/repositories/data-request-repository'

export class InMemoryConsentRecordRepository implements ConsentRecordRepository {
  readonly records: ConsentRecord[] = []

  async create(data: ConsentRecordData): Promise<void> {
    this.records.push(ConsentRecord.fromData(data))
  }

  async list(params: ListConsentRecordsParams): Promise<PaginatedResult<ConsentRecord>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50
    const items = [...this.records].sort(
      (a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime()
    )
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }
}

export class InMemoryDataRequestRepository implements DataRequestRepository {
  private readonly requests = new Map<string, DataRequest>()

  async create(data: DataRequestData): Promise<void> {
    this.requests.set(data.id, DataRequest.fromData(data))
  }

  async findById(id: string): Promise<DataRequest | null> {
    return this.requests.get(id) ?? null
  }

  async list(params: ListDataRequestsParams): Promise<PaginatedResult<DataRequest>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const items = [...this.requests.values()]
      .filter((request) => params.status === undefined || request.data.status === params.status)
      .sort((a, b) => b.data.createdAt.getTime() - a.data.createdAt.getTime())
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }

  async updateStatus(id: string, status: DataRequestStatus, updatedAt: Date): Promise<void> {
    const request = this.requests.get(id)
    if (!request) return
    request.data.status = status
    request.data.updatedAt = updatedAt
  }
}
