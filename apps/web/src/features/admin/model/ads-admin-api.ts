// Path: apps/web/src/features/admin/model/ads-admin-api.ts
// Repository admin de anúncios: rotas de curadoria (administrator) do módulo
// @digimon/ads — GET /ads/admin (filtros placement/kind/isActive + paginação),
// POST /ads/admin (cria), PATCH /ads/admin/:id (edita) e DELETE /ads/admin/:id.
// Reaproveita os tipos literais da feature ads (sem importar @digimon/ads no
// client). Via @digimon/api-client (ADR-007). Sem hooks, sem JSX — camada Model.
import type { PaginatedResult } from '@digimon/contracts'
import { apiClient } from '@/lib/api-base'
import type { Ad, AdKind, AdPlacement } from '@/features/ads/model/types'

export { ApiError } from '@digimon/api-client'

/** Tipos e posições de anúncio (espelho literal do backend — @digimon/ads). */
export const AD_KINDS: readonly AdKind[] = ['house', 'affiliate', 'sponsor']

export const AD_PLACEMENTS: readonly AdPlacement[] = [
  'home-top',
  'home-infeed',
  'cards-top',
  'article-inline'
]

export interface AdminAdsListParams {
  placement?: AdPlacement
  kind?: AdKind
  isActive?: boolean
  page?: number
  pageSize?: number
}

/** Payload de criação de anúncio (espelho do createAdSchema do backend). */
export interface AdUpsertInput {
  title: string
  subtitle: string | null
  imageUrl: string | null
  targetUrl: string
  kind: AdKind
  placements: string[]
  ctaLabel: string | null
  sponsorName: string | null
  disclosure: string | null
  isActive: boolean
  priority: number
  startAt: string | null
  endAt: string | null
  openInNewTab: boolean
}

/** Patch parcial para edição (o updateAdSchema é `.strict()` — só chaves válidas). */
export type AdUpsertPatch = Partial<AdUpsertInput>

function buildQuery(params: AdminAdsListParams): string {
  const search = new URLSearchParams()
  if (params.placement) search.set('placement', params.placement)
  if (params.kind) search.set('kind', params.kind)
  if (params.isActive !== undefined) search.set('isActive', String(params.isActive))
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const adsAdminApi = {
  list(params: AdminAdsListParams = {}): Promise<PaginatedResult<Ad>> {
    return apiClient.get(`/ads/admin${buildQuery(params)}`)
  },

  create(input: AdUpsertInput): Promise<{ id: string }> {
    return apiClient.post('/ads/admin', input)
  },

  update(id: string, input: AdUpsertPatch): Promise<{ id: string }> {
    return apiClient.patch(`/ads/admin/${encodeURIComponent(id)}`, input)
  },

  remove(id: string): Promise<void> {
    return apiClient.delete(`/ads/admin/${encodeURIComponent(id)}`)
  }
}
