// Path: apps/web/src/features/admin/model/site-gate-api.ts
// Model — acesso à API do site-gate (modo "em breve"). Sem hooks/JSX (MVVM).
export type SiteGateMode = 'live' | 'coming-soon'

const SITE_GATE_URL = '/api/settings/site-gate'

async function parseError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { error?: { message?: string } }
    return new Error(body.error?.message ?? 'Erro inesperado')
  } catch {
    return new Error('Erro inesperado')
  }
}

export async function fetchSiteGateMode(): Promise<SiteGateMode> {
  const response = await fetch(SITE_GATE_URL, { cache: 'no-store' })
  if (!response.ok) throw await parseError(response)
  const body = (await response.json()) as { mode: SiteGateMode }
  return body.mode
}

export async function setSiteGateMode(mode: SiteGateMode): Promise<SiteGateMode> {
  const response = await fetch(SITE_GATE_URL, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode })
  })
  if (!response.ok) throw await parseError(response)
  const body = (await response.json()) as { mode: SiteGateMode }
  return body.mode
}
