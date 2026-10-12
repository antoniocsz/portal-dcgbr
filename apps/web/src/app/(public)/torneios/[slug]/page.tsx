// Path: apps/web/src/app/(public)/torneios/[slug]/page.tsx
// Detalhamento de um torneio (SEO-first): generateMetadata busca o torneio
// server-side na API separada (base interna, ADR-007) e a View client-side
// (TournamentDetailView) hidrata os dados e as ações por papel. O fetch SSR
// encaminha o cookie de sessão para o organizador/Admin verem um torneio
// cancelado (o GET /tournaments/:slug é 404 para terceiros — sem vazar).
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '@digimon/auth'
import { apiBaseUrl } from '@/lib/api-base'
import { TournamentDetailView } from '@/features/tournaments/views'
import type { Tournament } from '@/features/tournaments/model/types'

async function fetchTournament(slug: string): Promise<Tournament | null> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const response = await fetch(`${apiBaseUrl}/tournaments/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      ...(token ? { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } } : {})
    })
    if (!response.ok) return null
    return (await response.json()) as Tournament
  } catch {
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tournament = await fetchTournament(slug)

  if (!tournament) {
    return { title: 'Torneio não encontrado', robots: { index: false } }
  }

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
  return <TournamentDetailView slug={slug} />
}
