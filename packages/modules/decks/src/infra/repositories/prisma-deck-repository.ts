// Path: packages/modules/decks/src/infra/repositories/prisma-deck-repository.ts
// Implementação Prisma de DeckRepository. Mapeia o enum DeckStatus (DRAFT/…)
// para a union do domínio (draft/…) e o Json `cardList`.
import { PrismaClient, Prisma, DeckStatus as PrismaDeckStatus } from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import {
  Deck,
  type DeckCardEntry,
  type DeckData,
  type DeckStatus
} from '../../domain/entities/deck'
import type { DeckCopyData } from '../../domain/entities/deck-copy'
import type { DeckRepository, ListDecksParams } from '../../domain/repositories/deck-repository'

const STATUS_TO_PRISMA: Record<DeckStatus, PrismaDeckStatus> = {
  draft: 'DRAFT',
  published: 'PUBLISHED'
}

const STATUS_FROM_PRISMA: Record<PrismaDeckStatus, DeckStatus> = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
}

function mapCardList(value: Prisma.JsonValue | null): DeckCardEntry[] {
  if (value === null) return []
  return value as unknown as DeckCardEntry[]
}

function toJson(cardList: DeckCardEntry[]): Prisma.InputJsonValue {
  return cardList as unknown as Prisma.InputJsonValue
}

function mapToDomain(row: Prisma.DeckGetPayload<Record<string, never>>): Deck {
  const data: DeckData = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ownerId: row.ownerId,
    description: row.description,
    cardList: mapCardList(row.cardList),
    format: row.format,
    status: STATUS_FROM_PRISMA[row.status],
    isPublic: row.isPublic,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Deck.fromData(data)
}

export class PrismaDeckRepository implements DeckRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: DeckData): Promise<void> {
    await this.db.deck.create({
      data: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        ownerId: data.ownerId,
        description: data.description,
        cardList: toJson(data.cardList),
        format: data.format,
        status: STATUS_TO_PRISMA[data.status],
        isPublic: data.isPublic,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async update(deck: Deck): Promise<void> {
    const d = deck.data
    await this.db.deck.update({
      where: { id: d.id },
      data: {
        slug: d.slug,
        name: d.name,
        description: d.description,
        cardList: toJson(d.cardList),
        format: d.format,
        status: STATUS_TO_PRISMA[d.status],
        isPublic: d.isPublic,
        updatedAt: d.updatedAt
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.deck.delete({ where: { id } })
  }

  async findById(id: string): Promise<Deck | null> {
    const row = await this.db.deck.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Deck | null> {
    const row = await this.db.deck.findUnique({ where: { slug } })
    return row ? mapToDomain(row) : null
  }

  async list(params: ListDecksParams): Promise<PaginatedResult<Deck>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.DeckWhereInput = {}
    if (params.publicOnly) {
      where.status = 'PUBLISHED'
      where.isPublic = true
    }
    if (params.status) where.status = STATUS_TO_PRISMA[params.status]
    if (params.ownerId) where.ownerId = params.ownerId
    if (params.format) where.format = { equals: params.format, mode: 'insensitive' }

    const search = params.search?.trim()
    if (search) {
      // Full-text no nome (ADR-003) — índice GIN "decks_search_idx" (migration).
      const matches = await this.db.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "decks"
        WHERE to_tsvector('simple', "name") @@ plainto_tsquery('simple', ${search})
          ${where.status !== undefined ? Prisma.sql`AND "status" = ${where.status}` : Prisma.empty}
          ${where.isPublic !== undefined ? Prisma.sql`AND "isPublic" = ${where.isPublic}` : Prisma.empty}
          ${where.ownerId !== undefined ? Prisma.sql`AND "ownerId" = ${where.ownerId}` : Prisma.empty}
          ${where.format !== undefined ? Prisma.sql`AND "format" = ${where.format}` : Prisma.empty}
        ORDER BY ts_rank(
          to_tsvector('simple', "name"),
          plainto_tsquery('simple', ${search})
        ) DESC
        LIMIT 1000
      `
      const ids = matches.map((match) => match.id)
      if (ids.length === 0) return { items: [], total: 0, page, pageSize }

      const [rows, total] = await this.db.$transaction([
        this.db.deck.findMany({
          where: { ...where, id: { in: ids } },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        this.db.deck.count({ where: { ...where, id: { in: ids } } })
      ])
      return { items: rows.map(mapToDomain), total, page, pageSize }
    }

    const [rows, total] = await this.db.$transaction([
      this.db.deck.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.deck.count({ where })
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }

  async createCopy(data: DeckCopyData): Promise<void> {
    await this.db.deckCopy.create({
      data: {
        id: data.id,
        sourceDeckId: data.sourceDeckId,
        copiedById: data.copiedById,
        createdAt: data.createdAt
      }
    })
  }
}
