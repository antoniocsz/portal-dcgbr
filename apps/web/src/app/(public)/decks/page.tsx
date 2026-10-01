// Path: apps/web/src/app/(public)/decks/page.tsx
// Decks da comunidade (SEO-first): metadata + DecksListView com grid de
// DeckCard e botão "+ Novo deck" (member publica direto, sem revisão).
import type { Metadata } from 'next'
import Link from 'next/link'
import { DecksListView } from '@/features/decks/views'

export const metadata: Metadata = {
  title: 'Decks da comunidade — Digimon TCG Brasil',
  description:
    'Deckbuilder colaborativo do Digimon TCG no Brasil: monte, salve, copie e compartilhe decks. Members publicam sem revisão.',
  alternates: { canonical: '/decks' },
  openGraph: {
    title: 'Decks da comunidade — Digimon TCG Brasil',
    description: 'Monte, salve, copie e compartilhe decks do Digimon TCG.',
    type: 'website'
  }
}

export default function DecksPage() {
  return (
    <DecksListView
      title="Decks da comunidade"
      description="Publique o seu sem revisão. Copie decks de outros membros."
      headerAction={
        <Link
          href="/decks/novo"
          className="inline-flex bg-primary px-4.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          + Novo deck
        </Link>
      }
    />
  )
}
