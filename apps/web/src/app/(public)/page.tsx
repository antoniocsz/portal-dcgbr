// Path: apps/web/src/app/(public)/page.tsx
// Home do portal (SEO-first): metadata + HomeView (ViewModel useHome).
import type { Metadata } from 'next'
import { HomeView } from '@/features/content/views'

export const metadata: Metadata = {
  title: { absolute: 'Digimon TCG Brasil — Notícias, cartas, decks e torneios' },
  description:
    'Portal brasileiro de referência do Digimon Card Game: notícias, cartas, decks, torneios ' +
    'e o simulador oficial Alysium.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Digimon TCG Brasil',
    description:
      'Notícias, cartas, decks e torneios do Digimon Card Game no Brasil.',
    type: 'website'
  }
}

export default function HomePage() {
  return <HomeView />
}
