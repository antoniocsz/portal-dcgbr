// Path: packages/modules/privacy/src/infra/repositories/prisma-consent-record-repository.ts
// Implementação Prisma de ConsentRecordRepository. Sem enums — mapeamento direto.
import { PrismaClient, Prisma } from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import { ConsentRecord, type ConsentRecordData } from '../../domain/entities/consent-record'
import type {
  ConsentRecordRepository,
  ListConsentRecordsParams
} from '../../domain/repositories/consent-record-repository'

function mapToDomain(row: Prisma.ConsentRecordGetPayload<Record<string, never>>): ConsentRecord {
  const data: ConsentRecordData = {
    id: row.id,
    subjectKey: row.subjectKey,
    userId: row.userId,
    analytics: row.analytics,
    ads: row.ads,
    policyVersion: row.policyVersion,
    userAgent: row.userAgent,
    createdAt: row.createdAt
  }
  return ConsentRecord.fromData(data)
}

export class PrismaConsentRecordRepository implements ConsentRecordRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: ConsentRecordData): Promise<void> {
    await this.db.consentRecord.create({
      data: {
        id: data.id,
        subjectKey: data.subjectKey,
        userId: data.userId,
        analytics: data.analytics,
        ads: data.ads,
        policyVersion: data.policyVersion,
        userAgent: data.userAgent,
        createdAt: data.createdAt
      }
    })
  }

  async list(params: ListConsentRecordsParams): Promise<PaginatedResult<ConsentRecord>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 50

    const [rows, total] = await this.db.$transaction([
      this.db.consentRecord.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.consentRecord.count()
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }
}
