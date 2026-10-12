// Path: packages/modules/ads/src/domain/repositories/ad-repository.ts
// Interface do repositório de anúncios — implementações: Prisma (infra) e
// in-memory (testes). Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { PaginatedResult } from '@digimon/contracts'
import type { Ad, AdData, AdKind } from '../entities/ad'

export interface ListAdsParams {
  placement?: string
  kind?: AdKind
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface AdRepository {
  create(data: AdData): Promise<void>
  update(ad: Ad): Promise<void>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Ad | null>
  list(params: ListAdsParams): Promise<PaginatedResult<Ad>>
  activeForPlacement(placement: string, now: Date): Promise<Ad[]>
  incrementImpressions(ids: string[]): Promise<void>
  incrementClicks(id: string): Promise<void>
}
