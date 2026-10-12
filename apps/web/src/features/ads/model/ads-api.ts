// Path: apps/web/src/features/ads/model/ads-api.ts
// Repository da feature: chamadas à API separada (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import { apiClient } from '@/lib/api-base'
import type { Ad, AdPlacement } from './types'

export { ApiError } from '@digimon/api-client'

export const adsApi = {
  /**
   * Anúncios ativos do placement (janela de datas + rotação por peso no backend).
   * Sem `limit`, o backend usa o default (5 candidatos) — base para a rotação.
   */
  listByPlacement(placement: AdPlacement, limit?: number): Promise<{ ads: Ad[] }> {
    const search = new URLSearchParams({ placement })
    if (limit !== undefined) search.set('limit', String(limit))
    return apiClient.get(`/ads?${search.toString()}`)
  },

  /** Registra o clique (best-effort) — 204 sem corpo. */
  trackClick(id: string): Promise<void> {
    return apiClient.post(`/ads/${encodeURIComponent(id)}/click`)
  }
}
