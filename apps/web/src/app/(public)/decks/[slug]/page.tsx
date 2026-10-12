// Path: apps/web/src/app/(public)/decks/[slug]/page.tsx
// Detalhe de um deck (SEO-first): generateMetadata via API e a View client-side
// (React Query) responsável pelos dados e ações. Rascunho de outro usuário
// responde 404 e a View mostra "não encontrado" sem vazar existência.
import type { Metadata } from 'next'
import { apiBaseUrl } from '@/lib/api-base'
import { DeckDetailView } from '@/features/decks/views'
import type { Deck } from '@/features/decks/model/types'

async function fetchDeck(slug: string): Promise<Deck | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/decks/${encodeURIComponent(slug)}`, {
      cache: 'no-store'
    })
    if (!response.ok) return null
    return (await response.json()) as Deck
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
  const deck = await fetchDeck(slug)
  if (!deck) return { title: 'Deck não encontrado' }

  const description = deck.description ?? `Deck do Digimon TCG Brasil — formato ${deck.format}.`
  return {
    title: `${deck.name} — deck de Digimon TCG`,
    description,
    alternates: { canonical: `/decks/${deck.slug}` },
    openGraph: { title: deck.name, description, type: 'article' }
  }
}

export default async function DeckDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <DeckDetailView slug={slug} />
}
