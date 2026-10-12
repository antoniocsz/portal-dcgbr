// Path: apps/web/src/app/(public)/torneios/[slug]/page.tsx
// Detalhamento de um torneio (SEO-first): generateMetadata busca o torneio
// server-side na API separada (base interna, ADR-007) e a View client-side
// (TournamentDetailView) hidrata os dados e as ações por papel.
// O Server Component responde 404 real (notFound) quando o fetch SSR — que
// encaminha o cookie de sessão — retorna 404 (slug inexistente ou torneio
// cancelado de terceiro, sem vazar existência). O organizador/Admin/Editor vê um
// torneio cancelado (o GET /tournaments/:slug é 404 para terceiros). Erros que
// não sejam 404 mantêm o comportamento anterior: renderiza a View, que trata o
// erro no cliente.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '@digimon/auth'
import { apiBaseUrl } from '@/lib/api-base'
import { TournamentDetailView } from '@/features/tournaments/views'
import type { Tournament } from '@/features/tournaments/model/types'

type FetchResult<T> = { status: 'ok'; data: T } | { status: 'not-found' } | { status: 'error' }

async function fetchTournament(slug: string): Promise<FetchResult<Tournament>> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const response = await fetch(`${apiBaseUrl}/tournaments/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      ...(token ? { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } } : {})
    })
    if (response.status === 404) return { status: 'not-found' }
    if (!response.ok) return { status: 'error' }
    return { status: 'ok', data: (await response.json()) as Tournament }
  } catch {
    return { status: 'error' }
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await fetchTournament(slug)

  if (result.status !== 'ok') {
    return { title: 'Torneio não encontrado', robots: { index: false } }
  }

  const tournament = result.data
  const description =
    tournament.description ??
    `Torneio de Digimon TCG em ${tournament.location} — formato ${tournament.format}.`

  return {
    title: `${tournament.name} — Torneio de Digimon TCG`,
    description,
    alternates: { canonical: `/torneios/${tournament.slug}` },
    openGraph: {
      title: tournament.name,
      description,
      type: 'article',
      locale: 'pt_BR',
      siteName: 'DigiTCG Brasil'
    },
    ...(tournament.status === 'cancelled' ? { robots: { index: false } } : {})
  }
}

export default async function TournamentDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await fetchTournament(slug)
  if (result.status === 'not-found') notFound()
  return <TournamentDetailView slug={slug} />
}
