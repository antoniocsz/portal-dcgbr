// Path: packages/modules/ads/src/test/memory-ad-repository.ts
// Repositório em memória para testes unitários — implementa AdRepository.
// Intercambiável com o PrismaAdRepository (Liskov) sem tocar nos use cases.
import type { PaginatedResult } from '@digimon/contracts'
import { Ad, type AdData } from '../domain/entities/ad'
import type { AdRepository, ListAdsParams } from '../domain/repositories/ad-repository'

export class InMemoryAdRepository implements AdRepository {
  private readonly ads = new Map<string, Ad>()
  readonly impressionBatches: string[][] = []

  async create(data: AdData): Promise<void> {
    this.ads.set(data.id, Ad.fromData(data))
  }

  async update(ad: Ad): Promise<void> {
    this.ads.set(ad.id, ad)
  }

  async delete(id: string): Promise<void> {
    this.ads.delete(id)
  }

  async findById(id: string): Promise<Ad | null> {
    return this.ads.get(id) ?? null
  }

  async list(params: ListAdsParams): Promise<PaginatedResult<Ad>> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const items = [...this.ads.values()]
      .filter(
        (ad) =>
          (params.placement === undefined || ad.data.placements.includes(params.placement)) &&
          (params.kind === undefined || ad.data.kind === params.kind) &&
          (params.isActive === undefined || ad.data.isActive === params.isActive)
      )
      .sort((a, b) => b.data.priority - a.data.priority)
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize
    }
  }

  async activeForPlacement(placement: string, now: Date): Promise<Ad[]> {
    return [...this.ads.values()]
      .filter((ad) => ad.data.placements.includes(placement) && ad.isVisibleAt(now))
      .sort((a, b) => b.data.priority - a.data.priority)
  }

  async incrementImpressions(ids: string[]): Promise<void> {
    this.impressionBatches.push([...ids])
    for (const id of ids) {
      const ad = this.ads.get(id)
      if (ad) ad.data.impressions += 1
    }
  }

  async incrementClicks(id: string): Promise<void> {
    const ad = this.ads.get(id)
    if (ad) ad.data.clicks += 1
  }
}
