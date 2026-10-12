// Path: packages/modules/ads/src/use-cases/list-ads.ts
// Duas leituras:
// - Curadoria (administrator): lista todos com filtros (placement/kind/isActive).
// - Público: exige `placement`, devolve os anúncios ativos dentro da janela de
//   datas, ordenados por peso (priority) desc — até N candidatos para rotação.
import type { PaginatedResult } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { isCuradoria, type Actor } from '../domain/actor'
import type { Ad } from '../domain/entities/ad'
import type { AdRepository, ListAdsParams } from '../domain/repositories/ad-repository'
import { listAdsSchema, type ListAdsInput } from './schemas'

/** Máximo de candidatos devolvidos na rotação pública quando `limit` não é informado. */
export const PUBLIC_ADS_LIMIT = 5

export interface ListAdsCommand {
  input: ListAdsInput
  actor?: Actor | null
  now?: Date
}

export class ListAdsUseCase {
  constructor(private readonly repo: AdRepository) {}

  async execute(command: ListAdsCommand): Promise<PaginatedResult<Ad>> {
    const parsed = listAdsSchema.parse(command.input)

    if (isCuradoria(command.actor ?? null)) {
      const params: ListAdsParams = {
        page: parsed.page ?? 1,
        pageSize: parsed.pageSize ?? 20
      }
      if (parsed.placement) params.placement = parsed.placement
      if (parsed.kind) params.kind = parsed.kind
      if (parsed.isActive !== undefined) params.isActive = parsed.isActive
      return this.repo.list(params)
    }

    if (!parsed.placement) {
      throw new ValidationError('placement é obrigatório na listagem pública de anúncios')
    }

    const now = command.now ?? new Date()
    const candidates = await this.repo.activeForPlacement(parsed.placement, now)
    const limit = parsed.limit ?? PUBLIC_ADS_LIMIT
    const items = candidates.slice(0, limit)

    return { items, total: candidates.length, page: 1, pageSize: limit }
  }
}
