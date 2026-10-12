// Path: apps/web/src/app/(public)/decks/comunidade/[id]/page.tsx
// Detalhe de um deck da comunidade (SEO-first): generateMetadata via API e a
// View client-side (React Query) responsável pelos dados e ações.
import type { Metadata } from 'next'
import { apiBaseUrl } from '@/lib/api-base'
import { CommunityDeckDetailView } from '@/features/decks/views'
import type { CommunityDeck } from '@/features/decks/model/community-types'

async function fetchCommunityDeck(id: string): Promise<CommunityDeck | null> {
  try {
    const response = await fetch(
      `${apiBaseUrl}/decks/community/${encodeURIComponent(id)}`,
      { cache: 'no-store' }
    )
    if (!response.ok) return null
    return (await response.json()) as CommunityDeck
  } catch {
    return null
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const deck = await fetchCommunityDeck(id)
  if (!deck) return { title: 'Deck não encontrado' }

  const description = `Deck publicado por ${deck.ownerName} na comunidade do Digimon TCG Brasil.`
  return {
    title: `${deck.name} — deck de ${deck.ownerName}`,
    description,
    alternates: { canonical: `/decks/comunidade/${deck.id}` },
    openGraph: { title: deck.name, description, type: 'article' }
  }
}

export default async function CommunityDeckPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CommunityDeckDetailView id={id} />
}
