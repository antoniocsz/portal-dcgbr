// Path: apps/web/src/proxy.ts
// Site-gate: quando o site está em modo "coming-soon" (configurado no painel
// admin), todo o site público é redirecionado para /em-breve. Rotas de gestão
// (/admin, /api), autenticação (/login, /registro) e a própria /em-breve
// permanecem acessíveis. Convenção do Next 16: arquivo `proxy.ts` exportando a
// função default `proxy` (sempre roda no runtime Node.js — sem segment config).
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSiteGate } from './lib/server/site-gate'

// Prefixos sempre acessíveis mesmo no modo em breve
const ALWAYS_OPEN = ['/admin', '/api', '/login', '/registro', '/em-breve']

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (ALWAYS_OPEN.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next()
  }

  const mode = await getSiteGate()
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
