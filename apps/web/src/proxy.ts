// Path: apps/web/src/proxy.ts
// Site-gate: quando o site está em modo "coming-soon" (configurado no painel
// admin), todo o site público é redirecionado para /em-breve. Rotas de gestão
// (/admin, /api), autenticação (/login, /registro) e a própria /em-breve
// permanecem acessíveis. Convenção do Next 16: arquivo `proxy.ts` exportando a
// função default `proxy` (sempre roda no runtime Node.js — sem segment config).
// O modo é lido da API separada (ADR-007) pelo endereço interno da rede; erro
// ou resposta não-ok → 'live' (o site nunca cai por causa do gate).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { apiBaseUrl } from '@/lib/api-base'

// Prefixos sempre acessíveis mesmo no modo em breve
const ALWAYS_OPEN = ['/admin', '/api', '/login', '/registro', '/em-breve']

type SiteGateMode = 'live' | 'coming-soon'

// Cache de módulo curto: evita um round-trip à API em toda request.
const CACHE_TTL_MS = 10_000
let cache: { mode: SiteGateMode; at: number } | null = null

async function getSiteGateMode(): Promise<SiteGateMode> {
  const now = Date.now()
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.mode

  let mode: SiteGateMode = 'live'
  try {
    const response = await fetch(`${apiBaseUrl}/settings/site-gate`, { cache: 'no-store' })
    if (response.ok) {
      const body = (await response.json()) as { mode?: unknown }
      if (body.mode === 'coming-soon' || body.mode === 'live') mode = body.mode
    }
  } catch {
    // API indisponível: mantém 'live' — o portal não fica fora do ar.
  }

  cache = { mode, at: now }
  return mode
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (ALWAYS_OPEN.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next()
  }

  const mode = await getSiteGateMode()
  if (mode === 'coming-soon') {
    const url = request.nextUrl.clone()
    url.pathname = '/em-breve'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Matcher: roda em tudo, exceto assets estáticos (/_next/static, /_next/image),
// favicon e arquivos com extensão (imagens públicas como /dcg-logo.png).
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
