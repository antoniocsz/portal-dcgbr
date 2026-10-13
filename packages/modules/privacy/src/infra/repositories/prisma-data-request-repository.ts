// Path: packages/modules/privacy/src/infra/repositories/prisma-data-request-repository.ts
// Implementação Prisma de DataRequestRepository. Mapeia os enums do Prisma
// (ACCESS/…) para as unions do domínio (access/…).
import {
  PrismaClient,
  Prisma,
  DataRequestType as PrismaDataRequestType,
  DataRequestStatus as PrismaDataRequestStatus
} from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import {
  DataRequest,
  type DataRequestData,
  type DataRequestStatus,
  type DataRequestType
} from '../../domain/entities/data-request'
import type {
  DataRequestRepository,
  ListDataRequestsParams
} from '../../domain/repositories/data-request-repository'

const TYPE_TO_PRISMA: Record<DataRequestType, PrismaDataRequestType> = {
  access: 'ACCESS',
  correction: 'CORRECTION',
  deletion: 'DELETION',
  portability: 'PORTABILITY',
  consent_revocation: 'CONSENT_REVOCATION',
  other: 'OTHER'
}

const TYPE_FROM_PRISMA: Record<PrismaDataRequestType, DataRequestType> = {
  ACCESS: 'access',
  CORRECTION: 'correction',
  DELETION: 'deletion',
  PORTABILITY: 'portability',
  CONSENT_REVOCATION: 'consent_revocation',
  OTHER: 'other'
}

const STATUS_TO_PRISMA: Record<DataRequestStatus, PrismaDataRequestStatus> = {
  open: 'OPEN',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
  rejected: 'REJECTED'
}

const STATUS_FROM_PRISMA: Record<PrismaDataRequestStatus, DataRequestStatus> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  REJECTED: 'rejected'
}

function mapToDomain(row: Prisma.DataRequestGetPayload<Record<string, never>>): DataRequest {
  const data: DataRequestData = {
    id: row.id,
    type: TYPE_FROM_PRISMA[row.type],
    name: row.name,
    email: row.email,
    message: row.message,
    userId: row.userId,
    status: STATUS_FROM_PRISMA[row.status],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return DataRequest.fromData(data)
}

export class PrismaDataRequestRepository implements DataRequestRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: DataRequestData): Promise<void> {
    await this.db.dataRequest.create({
      data: {
        id: data.id,
        type: TYPE_TO_PRISMA[data.type],
        name: data.name,
        email: data.email,
        message: data.message,
        userId: data.userId,
        status: STATUS_TO_PRISMA[data.status],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async findById(id: string): Promise<DataRequest | null> {
    const row = await this.db.dataRequest.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async list(params: ListDataRequestsParams): Promise<PaginatedResult<DataRequest>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.DataRequestWhereInput = {}
    if (params.status) where.status = STATUS_TO_PRISMA[params.status]

    const [rows, total] = await this.db.$transaction([
      this.db.dataRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.dataRequest.count({ where })
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }

  async updateStatus(id: string, status: DataRequestStatus, updatedAt: Date): Promise<void> {
    await this.db.dataRequest.update({
      where: { id },
      data: { status: STATUS_TO_PRISMA[status], updatedAt }
    })
  }
}
