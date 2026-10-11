// Path: apps/web/src/features/admin/model/site-gate-api.ts
// Model — acesso à API do site-gate (modo "em breve") via @digimon/api-client.
// Sem hooks/JSX (MVVM).
import { apiClient } from '@/lib/api-base'

export type SiteGateMode = 'live' | 'coming-soon'

export async function fetchSiteGateMode(): Promise<SiteGateMode> {
  const body = await apiClient.request<{ mode: SiteGateMode }>('/settings/site-gate', {
    cache: 'no-store'
  })
  return body.mode
}

export async function setSiteGateMode(mode: SiteGateMode): Promise<SiteGateMode> {
  const body = await apiClient.patch<{ mode: SiteGateMode }>('/settings/site-gate', { mode })
  return body.mode
}
