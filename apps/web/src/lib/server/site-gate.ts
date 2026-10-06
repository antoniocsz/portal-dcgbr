// Path: apps/web/src/lib/server/site-gate.ts
// Configuração "modo do site" (site-gate): 'live' (padrão) ou 'coming-soon'.
// Lida pelo middleware (redireciona o público ao modo em breve) e pela página
// de configurações do admin. Cache in-process em globalThis com TTL curto —
// evita um SELECT em toda request; o PATCH (setSiteGate) limpa o cache na hora.
// Server-only (usa @digimon/database).
import { prisma } from '@digimon/database'

export type SiteGateMode = 'live' | 'coming-soon'

export const SITE_GATE_KEY = 'site_gate'
const CACHE_TTL_MS = 10_000

interface SiteGateCache {
  mode: SiteGateMode
  at: number
}

function cacheRef(): { cache?: SiteGateCache } {
  return globalThis as unknown as { cache?: SiteGateCache }
}

export function isSiteGateMode(value: unknown): value is SiteGateMode {
  return value === 'live' || value === 'coming-soon'
}

export async function getSiteGate(): Promise<SiteGateMode> {
  const ref = cacheRef()
  const now = Date.now()
  if (ref.cache && now - ref.cache.at < CACHE_TTL_MS) {
    return ref.cache.mode
  }
  let mode: SiteGateMode = 'live'
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_GATE_KEY } })
    if (row && isSiteGateMode(row.value)) mode = row.value
  } catch {
    // Banco indisponível: mantém o modo default (live) — site não fica fora do ar.
  }
  ref.cache = { mode, at: now }
  return mode
}

/** Persiste e atualiza o cache imediatamente (toggle do admin). */
export async function setSiteGate(mode: SiteGateMode): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: SITE_GATE_KEY },
    create: { key: SITE_GATE_KEY, value: mode },
    update: { value: mode }
  })
  cacheRef().cache = { mode, at: Date.now() }
}
