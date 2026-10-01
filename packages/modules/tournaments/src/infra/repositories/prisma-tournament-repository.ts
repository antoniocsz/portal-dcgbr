// Path: packages/modules/tournaments/src/infra/repositories/prisma-tournament-repository.ts
// Implementação Prisma de TournamentRepository. Mapeia os enums do Prisma
// (PUBLISHED/…) para as unions do domínio (published/…) e o Json `results`.
import {
  PrismaClient,
  Prisma,
  TournamentStatus as PrismaTournamentStatus
} from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import {
  Tournament,
  type TournamentData,
  type TournamentResultEntry,
  type TournamentStatus
} from '../../domain/entities/tournament'
import type {
  ListTournamentsParams,
  TournamentRepository
} from '../../domain/repositories/tournament-repository'

const STATUS_TO_PRISMA: Record<TournamentStatus, PrismaTournamentStatus> = {
  published: 'PUBLISHED',
  cancelled: 'CANCELLED',
  finished: 'FINISHED'
}

const STATUS_FROM_PRISMA: Record<PrismaTournamentStatus, TournamentStatus> = {
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  FINISHED: 'finished'
}

function mapResults(value: Prisma.JsonValue | null): TournamentResultEntry[] | null {
  if (value === null) return null
  return value as unknown as TournamentResultEntry[]
}

function toJson(
  results: TournamentResultEntry[] | null
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return results === null ? Prisma.DbNull : (results as unknown as Prisma.InputJsonValue)
}

function mapToDomain(row: Prisma.TournamentGetPayload<Record<string, never>>): Tournament {
  const data: TournamentData = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    organizerId: row.organizerId,
    description: row.description,
    format: row.format,
    location: row.location,
    dateStart: row.dateStart,
    dateEnd: row.dateEnd,
    status: STATUS_FROM_PRISMA[row.status],
    results: mapResults(row.results),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Tournament.fromData(data)
}

export class PrismaTournamentRepository implements TournamentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: TournamentData): Promise<void> {
    await this.db.tournament.create({
      data: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        organizerId: data.organizerId,
        description: data.description,
        format: data.format,
        location: data.location,
        dateStart: data.dateStart,
        dateEnd: data.dateEnd,
        status: STATUS_TO_PRISMA[data.status],
        results: toJson(data.results),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async update(tournament: Tournament): Promise<void> {
    const d = tournament.data
    await this.db.tournament.update({
      where: { id: d.id },
      data: {
        slug: d.slug,
        name: d.name,
        description: d.description,
        format: d.format,
        location: d.location,
        dateStart: d.dateStart,
        dateEnd: d.dateEnd,
        status: STATUS_TO_PRISMA[d.status],
        results: toJson(d.results),
        updatedAt: d.updatedAt
      }
    })
  }

  async findById(id: string): Promise<Tournament | null> {
    const row = await this.db.tournament.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Tournament | null> {
    const row = await this.db.tournament.findUnique({ where: { slug } })
    return row ? mapToDomain(row) : null
  }

  async list(params: ListTournamentsParams): Promise<PaginatedResult<Tournament>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.TournamentWhereInput = {}
    if (params.status) where.status = STATUS_TO_PRISMA[params.status]
    if (params.format) where.format = { equals: params.format, mode: 'insensitive' }
    if (params.location) where.location = { contains: params.location, mode: 'insensitive' }
    if (params.organizerId) where.organizerId = params.organizerId
    if (params.from) where.dateStart = { gte: params.from }

    const [rows, total] = await this.db.$transaction([
      this.db.tournament.findMany({
        where,
        orderBy: { dateStart: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.tournament.count({ where })
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }
}
