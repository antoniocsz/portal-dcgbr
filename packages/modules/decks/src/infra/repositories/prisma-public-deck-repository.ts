// Path: packages/modules/decks/src/infra/repositories/prisma-public-deck-repository.ts
// Implementação Prisma de PublicDeckRepository. Mapeia o enum PublicDeckStatus
// (PUBLIC/HIDDEN/UNPUBLISHED) para a union do domínio e o Json colors/cardList.
// Contadores (like/unlike/addCopy) e status são mutados por SQL raw para NÃO
// tocar `updatedAt` — que representa o último congelamento de conteúdo (usado
// pelo flag `outdated`). O join de autor traz `User.name`.
import {
  Prisma,
  PrismaClient,
  PublicDeckStatus as PrismaPublicDeckStatus
} from '@digimon/database'
import type {
  CommunityDeckReport,
  CommunityDeckStatus,
  ReportedCommunityDeck
} from '../../domain/community/community-types'
import type { DeckCardEntry } from '../../domain/entities/deck'
import { PublicDeck, type PublicDeckData } from '../../domain/entities/public-deck'
import type {
  CopyResult,
  CreatePublicDeckReportData,
  LikeResult,
  ListPublicDecksQuery,
  PublicDeckPage,
  PublicDeckRecord,
  PublicDeckRepository,
  PublicationRecord,
  UnlikeResult
} from '../../domain/repositories/public-deck-repository'

const STATUS_TO_PRISMA: Record<CommunityDeckStatus, PrismaPublicDeckStatus> = {
  public: 'PUBLIC',
  hidden: 'HIDDEN',
  unpublished: 'UNPUBLISHED'
}

const STATUS_FROM_PRISMA: Record<PrismaPublicDeckStatus, CommunityDeckStatus> = {
  PUBLIC: 'public',
  HIDDEN: 'hidden',
  UNPUBLISHED: 'unpublished'
}

function mapEntries(value: Prisma.JsonValue | null): DeckCardEntry[] {
  if (value === null) return []
  return value as unknown as DeckCardEntry[]
}

function mapColors(value: Prisma.JsonValue | null): string[] {
  if (value === null) return []
  return value as unknown as string[]
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue
}

type PublicDeckRow = Prisma.PublicDeckGetPayload<Record<string, never>>
type ReportRow = Prisma.CommunityDeckReportGetPayload<Record<string, never>>

function mapToDomain(row: PublicDeckRow): PublicDeck {
  const data: PublicDeckData = {
    id: row.id,
    accountId: row.accountId,
    sourceDeckId: row.sourceDeckId,
    name: row.name,
    colors: mapColors(row.colors),
    cardList: mapEntries(row.cardList),
    eggList: mapEntries(row.eggList),
    coverCardId: row.coverCardId,
    likeCount: row.likeCount,
    copyCount: row.copyCount,
    status: STATUS_FROM_PRISMA[row.status],
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt
  }
  return PublicDeck.fromData(data)
}

function mapReport(row: ReportRow): CommunityDeckReport {
  return {
    id: row.id,
    publicDeckId: row.publicDeckId,
    reporterAccountId: row.reporterAccountId,
    reason: row.reason,
    details: row.details,
    createdAt: row.createdAt,
    dismissedAt: row.dismissedAt
  }
}

function buildWhere(query: ListPublicDecksQuery): Prisma.PublicDeckWhereInput {
  const where: Prisma.PublicDeckWhereInput = {
    status: STATUS_TO_PRISMA[query.status]
  }
  if (query.colors && query.colors.length > 0) {
    where.colors = { array_contains: query.colors }
  }
  const search = query.search?.trim()
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { account: { name: { contains: search, mode: 'insensitive' } } }
    ]
  }
  return where
}

const RECORD_INCLUDE = (viewerId: string | null | undefined) => ({
  account: { select: { name: true } },
  likes: { where: { accountId: viewerId ?? '' }, select: { id: true }, take: 1 }
})

type RowWithRelations = Prisma.PublicDeckGetPayload<{
  include: {
    account: { select: { name: true } }
    likes: { select: { id: true } }
  }
}>

function toRecord(row: RowWithRelations): PublicDeckRecord {
  return {
    deck: mapToDomain(row),
    ownerName: row.account.name,
    likedByMe: row.likes.length > 0
  }
}

export class PrismaPublicDeckRepository implements PublicDeckRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: PublicDeckData): Promise<void> {
    await this.db.publicDeck.create({
      data: {
        id: data.id,
        accountId: data.accountId,
        sourceDeckId: data.sourceDeckId,
        name: data.name,
        colors: toJson(data.colors),
        cardList: toJson(data.cardList),
        eggList: toJson(data.eggList),
        coverCardId: data.coverCardId,
        likeCount: data.likeCount,
        copyCount: data.copyCount,
        status: STATUS_TO_PRISMA[data.status],
        publishedAt: data.publishedAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async update(deck: PublicDeck): Promise<void> {
    const d = deck.data
    await this.db.publicDeck.update({
      where: { id: d.id },
      data: {
        name: d.name,
        colors: toJson(d.colors),
        cardList: toJson(d.cardList),
        eggList: toJson(d.eggList),
        coverCardId: d.coverCardId,
        status: STATUS_TO_PRISMA[d.status],
        updatedAt: d.updatedAt
      }
    })
  }

  async findBySourceDeck(
    accountId: string,
    sourceDeckId: string
  ): Promise<PublicDeck | null> {
    const row = await this.db.publicDeck.findUnique({
      where: { accountId_sourceDeckId: { accountId, sourceDeckId } }
    })
    return row ? mapToDomain(row) : null
  }

  async findById(id: string, viewerId?: string | null): Promise<PublicDeckRecord | null> {
    const row = await this.db.publicDeck.findUnique({
      where: { id },
      include: RECORD_INCLUDE(viewerId)
    })
    return row ? toRecord(row) : null
  }

  async list(query: ListPublicDecksQuery): Promise<PublicDeckPage> {
    if (query.sort === 'top' && query.since) {
      return this.listTopByRecentLikes(query)
    }

    const take = query.pageSize + 1
    const skip = (query.page - 1) * query.pageSize
    const orderBy: Prisma.PublicDeckOrderByWithRelationInput[] =
      query.sort === 'new'
        ? [{ publishedAt: 'desc' }]
        : [{ likeCount: 'desc' }, { publishedAt: 'desc' }]

    const rows = await this.db.publicDeck.findMany({
      where: buildWhere(query),
      orderBy,
      skip,
      take,
      include: RECORD_INCLUDE(query.viewerId)
    })

    return {
      items: rows.slice(0, query.pageSize).map(toRecord),
      hasMore: rows.length > query.pageSize
    }
  }

  async publications(ownerId: string): Promise<PublicationRecord[]> {
    const rows = await this.db.publicDeck.findMany({
      where: { accountId: ownerId, status: { in: ['PUBLIC', 'HIDDEN'] } },
      include: { sourceDeck: { select: { updatedAt: true } } },
      orderBy: { publishedAt: 'desc' }
    })
    return rows.map((row) => ({
      deck: mapToDomain(row),
      sourceUpdatedAt: row.sourceDeck.updatedAt
    }))
  }

  async unpublish(id: string): Promise<void> {
    await this.db.$executeRaw`
      UPDATE "public_decks" SET "status" = 'UNPUBLISHED' WHERE "id" = ${id}
    `
  }

  async setStatus(id: string, status: CommunityDeckStatus): Promise<void> {
    const value = STATUS_TO_PRISMA[status]
    await this.db.$executeRaw`
      UPDATE "public_decks" SET "status" = ${value}::"PublicDeckStatus" WHERE "id" = ${id}
    `
  }

  async like(publicDeckId: string, accountId: string): Promise<LikeResult> {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.publicDeckLike.findUnique({
        where: { publicDeckId_accountId: { publicDeckId, accountId } },
        select: { id: true }
      })
      if (existing) {
        return { created: false, likeCount: await readLikeCount(tx, publicDeckId) }
      }
      await tx.publicDeckLike.create({ data: { publicDeckId, accountId } })
      const rows = await tx.$queryRaw<{ likeCount: number }[]>`
        UPDATE "public_decks" SET "likeCount" = "likeCount" + 1
        WHERE "id" = ${publicDeckId} RETURNING "likeCount"
      `
      return { created: true, likeCount: rows[0]?.likeCount ?? 0 }
    })
  }

  async unlike(publicDeckId: string, accountId: string): Promise<UnlikeResult> {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.publicDeckLike.findUnique({
        where: { publicDeckId_accountId: { publicDeckId, accountId } },
        select: { id: true }
      })
      if (!existing) {
        return { removed: false, likeCount: await readLikeCount(tx, publicDeckId) }
      }
      await tx.publicDeckLike.delete({ where: { id: existing.id } })
      const rows = await tx.$queryRaw<{ likeCount: number }[]>`
        UPDATE "public_decks" SET "likeCount" = GREATEST("likeCount" - 1, 0)
        WHERE "id" = ${publicDeckId} RETURNING "likeCount"
      `
      return { removed: true, likeCount: rows[0]?.likeCount ?? 0 }
    })
  }

  async addCopy(publicDeckId: string, accountId: string): Promise<CopyResult> {
    return this.db.$transaction(async (tx) => {
      const inserted = await tx.publicDeckCopy.createMany({
        data: [{ publicDeckId, accountId }],
        skipDuplicates: true
      })
      if (inserted.count === 0) {
        const rows = await tx.$queryRaw<{ copyCount: number }[]>`
          SELECT "copyCount" FROM "public_decks" WHERE "id" = ${publicDeckId}
        `
        return { created: false, copyCount: rows[0]?.copyCount ?? 0 }
      }
      const rows = await tx.$queryRaw<{ copyCount: number }[]>`
        UPDATE "public_decks" SET "copyCount" = "copyCount" + 1
        WHERE "id" = ${publicDeckId} RETURNING "copyCount"
      `
      return { created: true, copyCount: rows[0]?.copyCount ?? 0 }
    })
  }

  async report(data: CreatePublicDeckReportData): Promise<CommunityDeckReport> {
    return this.db.$transaction(async (tx) => {
      await tx.communityDeckReport.updateMany({
        where: {
          publicDeckId: data.publicDeckId,
          reporterAccountId: data.reporterAccountId,
          dismissedAt: null
        },
        data: { dismissedAt: new Date() }
      })
      const row = await tx.communityDeckReport.create({
        data: {
          publicDeckId: data.publicDeckId,
          reporterAccountId: data.reporterAccountId,
          reason: data.reason,
          details: data.details
        }
      })
      return mapReport(row)
    })
  }

  async listReports(publicDeckId: string): Promise<CommunityDeckReport[]> {
    const rows = await this.db.communityDeckReport.findMany({
      where: { publicDeckId, dismissedAt: null },
      orderBy: { createdAt: 'asc' }
    })
    return rows.map(mapReport)
  }

  async queueReports(): Promise<ReportedCommunityDeck[]> {
    const rows = await this.db.communityDeckReport.findMany({
      where: { dismissedAt: null },
      include: { publicDeck: { include: { account: { select: { name: true } } } } },
      orderBy: { createdAt: 'asc' }
    })

    const grouped = new Map<string, ReportedCommunityDeck>()
    for (const row of rows) {
      const deck = row.publicDeck
      const current = grouped.get(deck.id)
      if (current) {
        current.reportCount += 1
        if (row.createdAt.getTime() > current.lastReportedAt.getTime()) {
          current.lastReportedAt = row.createdAt
        }
        continue
      }
      grouped.set(deck.id, {
        publicDeckId: deck.id,
        name: deck.name,
        ownerId: deck.accountId,
        ownerName: deck.account.name,
        status: STATUS_FROM_PRISMA[deck.status],
        likeCount: deck.likeCount,
        reportCount: 1,
        lastReportedAt: row.createdAt
      })
    }
    return [...grouped.values()]
  }

  async dismissReports(publicDeckId: string): Promise<number> {
    const result = await this.db.communityDeckReport.updateMany({
      where: { publicDeckId, dismissedAt: null },
      data: { dismissedAt: new Date() }
    })
    return result.count
  }

  private async listTopByRecentLikes(query: ListPublicDecksQuery): Promise<PublicDeckPage> {
    const take = query.pageSize + 1
    const skip = (query.page - 1) * query.pageSize
    const since = query.since ?? new Date(0)
    const search = query.search?.trim()

    const colorsClause =
      query.colors && query.colors.length > 0
        ? Prisma.sql`AND pd."colors" @> ${JSON.stringify(query.colors)}::jsonb`
        : Prisma.empty
    const searchClause = search
      ? Prisma.sql`AND (pd."name" ILIKE ${'%' + search + '%'}
          OR u."name" ILIKE ${'%' + search + '%'})`
      : Prisma.empty

    const ranked = await this.db.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT pd."id"
      FROM "public_decks" pd
      JOIN "User" u ON u."id" = pd."accountId"
      WHERE pd."status"::text = ${STATUS_TO_PRISMA[query.status]}
        ${colorsClause}
        ${searchClause}
      ORDER BY (
        SELECT COUNT(*) FROM "public_deck_likes" pl
        WHERE pl."publicDeckId" = pd."id" AND pl."createdAt" >= ${since}
      ) DESC, pd."publishedAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `)

    const ids = ranked.map((row) => row.id)
    if (ids.length === 0) return { items: [], hasMore: false }

    const rows = await this.db.publicDeck.findMany({
      where: { id: { in: ids } },
      include: RECORD_INCLUDE(query.viewerId)
    })
    const byId = new Map(rows.map((row) => [row.id, row]))
    const ordered: PublicDeckRecord[] = []
    for (const id of ids.slice(0, query.pageSize)) {
      const row = byId.get(id)
      if (row) ordered.push(toRecord(row))
    }
    return { items: ordered, hasMore: ids.length > query.pageSize }
  }
}

async function readLikeCount(
  tx: Prisma.TransactionClient,
  publicDeckId: string
): Promise<number> {
  const rows = await tx.$queryRaw<{ likeCount: number }[]>`
    SELECT "likeCount" FROM "public_decks" WHERE "id" = ${publicDeckId}
  `
  return rows[0]?.likeCount ?? 0
}
