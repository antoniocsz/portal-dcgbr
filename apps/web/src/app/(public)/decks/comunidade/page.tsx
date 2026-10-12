// Path: apps/web/src/app/(public)/decks/comunidade/page.tsx
// Feed público da comunidade de decks (SEO-first): metadata + CommunityDecksView.
import type { Metadata } from 'next'
import { CommunityDecksView } from '@/features/decks/views'

export const metadata: Metadata = {
  title: 'Comunidade de decks — Digimon TCG Brasil',
  description:
    'Descubra, curta e copie decks publicados pela comunidade do Digimon Card Game no Brasil.',
  alternates: { canonical: '/decks/comunidade' },
  openGraph: {
    title: 'Comunidade de decks — Digimon TCG Brasil',
    description: 'Descubra e copie decks publicados pela comunidade.',
    type: 'website'
  }
}

export default function CommunityDecksPage() {
  return <CommunityDecksView />
}
