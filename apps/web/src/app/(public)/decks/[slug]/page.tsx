// Path: apps/web/src/app/(public)/decks/[slug]/page.tsx
// Detalhe de um deck (SEO-first): generateMetadata via API e a View client-side
// (React Query) responsável pelos dados e ações.
// O Server Component responde 404 real (notFound) quando o fetch SSR — que
// encaminha o cookie de sessão — retorna 404 (slug inexistente ou rascunho de
// terceiro, sem vazar existência). O dono abrindo o próprio rascunho recebe 200
// (o GET /decks/:slug é 404 para não-dono). Erros que não sejam 404 mantêm o
// comportamento anterior: renderiza a View, que trata o erro no cliente.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '@digimon/auth'
import { apiBaseUrl } from '@/lib/api-base'
import { DeckDetailView } from '@/features/decks/views'
import type { Deck } from '@/features/decks/model/types'

type FetchResult<T> = { status: 'ok'; data: T } | { status: 'not-found' } | { status: 'error' }

async function fetchDeck(slug: string): Promise<FetchResult<Deck>> {
  const store = await cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  try {
    const response = await fetch(`${apiBaseUrl}/decks/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      ...(token ? { headers: { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } } : {})
    })
    if (response.status === 404) return { status: 'not-found' }
    if (!response.ok) return { status: 'error' }
    return { status: 'ok', data: (await response.json()) as Deck }
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
  const result = await fetchDeck(slug)
  if (result.status !== 'ok') return { title: 'Deck não encontrado' }
  const deck = result.data

  const description = deck.description ?? `Deck do Digimon TCG Brasil — formato ${deck.format}.`
  return {
    title: `${deck.name} — deck de Digimon TCG`,
    description,
    alternates: { canonical: `/decks/${deck.slug}` },
    openGraph: { title: deck.name, description, type: 'article' },
    ...(deck.status === 'draft' ? { robots: { index: false } } : {})
  }
}

export default async function DeckDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = await fetchDeck(slug)
  if (result.status === 'not-found') notFound()
  return <DeckDetailView slug={slug} />
}
