// Path: apps/web/src/app/(public)/cartas/[id]/page.tsx
// Ficha da Carta (SEO-first): generateMetadata busca a carta server-side na API
// pública; a View (CardDetailView) hidrata os dados no client via useCard.
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { CardDetailView } from '@/features/cards/views'
import type { Card } from '@/features/cards/model/types'

async function fetchCard(id: string): Promise<Card | null> {
  const headerList = await headers()
  const host = headerList.get('host')
  if (!host) return null

  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const url = `${protocol}://${host}/api/cards/${encodeURIComponent(id)}`

  try {
    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return null
    return (await response.json()) as Card
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
  const card = await fetchCard(id)

  if (!card) return { title: 'Carta não encontrada' }

  const color = card.colors[0] ?? 'option'
  return {
    title: `${card.name} (${card.number}) — Cartas Digimon TCG`,
    description:
      card.effects?.slice(0, 160) ?? `Ficha da carta ${card.name} — ${card.number} do Digimon TCG.`,
    alternates: { canonical: `/cartas/${card.id}` },
    openGraph: {
      title: `${card.name} — ${card.number}`,
      description: card.effects?.slice(0, 160) ?? undefined,
      type: 'article',
      images: card.imageUrl ? [card.imageUrl] : undefined,
      locale: 'pt_BR',
      siteName: 'DigiTCG Brasil',
      tags: [color, card.type]
    }
  }
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await fetchCard(id)

  if (!card) notFound()

  return <CardDetailView id={id} />
}
