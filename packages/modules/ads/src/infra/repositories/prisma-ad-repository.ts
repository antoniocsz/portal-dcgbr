// Path: packages/modules/ads/src/infra/repositories/prisma-ad-repository.ts
// Implementação Prisma de AdRepository. Mapeia o enum do Prisma (HOUSE/…) para
// a union do domínio (house/…) e o escalar `placements String[]`.
import { PrismaClient, Prisma, AdKind as PrismaAdKind } from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import { Ad, type AdData, type AdKind } from '../../domain/entities/ad'
import type { AdRepository, ListAdsParams } from '../../domain/repositories/ad-repository'

const KIND_TO_PRISMA: Record<AdKind, PrismaAdKind> = {
  house: 'HOUSE',
  affiliate: 'AFFILIATE',
  sponsor: 'SPONSOR'
}

const KIND_FROM_PRISMA: Record<PrismaAdKind, AdKind> = {
  HOUSE: 'house',
  AFFILIATE: 'affiliate',
  SPONSOR: 'sponsor'
}

function mapToDomain(row: Prisma.AdGetPayload<Record<string, never>>): Ad {
  const data: AdData = {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    targetUrl: row.targetUrl,
    kind: KIND_FROM_PRISMA[row.kind],
    placements: row.placements,
    ctaLabel: row.ctaLabel,
    sponsorName: row.sponsorName,
    disclosure: row.disclosure,
    isActive: row.isActive,
    priority: row.priority,
    startAt: row.startAt,
    endAt: row.endAt,
    openInNewTab: row.openInNewTab,
    impressions: row.impressions,
    clicks: row.clicks,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Ad.fromData(data)
}

function activeWindowWhere(now: Date): Prisma.AdWhereInput[] {
  return [
    { OR: [{ startAt: null }, { startAt: { lte: now } }] },
    { OR: [{ endAt: null }, { endAt: { gte: now } }] }
  ]
}

export class PrismaAdRepository implements AdRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: AdData): Promise<void> {
    await this.db.ad.create({
      data: {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        kind: KIND_TO_PRISMA[data.kind],
        placements: data.placements,
        ctaLabel: data.ctaLabel,
        sponsorName: data.sponsorName,
        disclosure: data.disclosure,
        isActive: data.isActive,
        priority: data.priority,
        startAt: data.startAt,
        endAt: data.endAt,
        openInNewTab: data.openInNewTab,
        impressions: data.impressions,
        clicks: data.clicks,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    })
  }

  async update(ad: Ad): Promise<void> {
    const d = ad.data
    await this.db.ad.update({
      where: { id: d.id },
      data: {
        title: d.title,
        subtitle: d.subtitle,
        imageUrl: d.imageUrl,
        targetUrl: d.targetUrl,
        kind: KIND_TO_PRISMA[d.kind],
        placements: d.placements,
        ctaLabel: d.ctaLabel,
        sponsorName: d.sponsorName,
        disclosure: d.disclosure,
        isActive: d.isActive,
        priority: d.priority,
        startAt: d.startAt,
        endAt: d.endAt,
        openInNewTab: d.openInNewTab,
        updatedAt: d.updatedAt
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.ad.delete({ where: { id } })
  }

  async findById(id: string): Promise<Ad | null> {
    const row = await this.db.ad.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async list(params: ListAdsParams): Promise<PaginatedResult<Ad>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20

    const where: Prisma.AdWhereInput = {}
    if (params.placement) where.placements = { has: params.placement }
    if (params.kind) where.kind = KIND_TO_PRISMA[params.kind]
    if (params.isActive !== undefined) where.isActive = params.isActive

    const [rows, total] = await this.db.$transaction([
      this.db.ad.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      this.db.ad.count({ where })
    ])

    return { items: rows.map(mapToDomain), total, page, pageSize }
  }

  async activeForPlacement(placement: string, now: Date): Promise<Ad[]> {
    const rows = await this.db.ad.findMany({
      where: {
        isActive: true,
        placements: { has: placement },
        AND: activeWindowWhere(now)
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    })
    return rows.map(mapToDomain)
  }

  async incrementImpressions(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    await this.db.ad.updateMany({
      where: { id: { in: ids } },
      data: { impressions: { increment: 1 } }
    })
  }

  async incrementClicks(id: string): Promise<void> {
    await this.db.ad.update({ where: { id }, data: { clicks: { increment: 1 } } })
  }
}
