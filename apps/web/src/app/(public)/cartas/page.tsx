// Path: apps/web/src/app/(public)/cartas/page.tsx
// Card Database (SEO-first): metadata + CardsView (busca full-text + filtros
// por cor/tipo + grid de CardTile + paginação).
import type { Metadata } from 'next'
import { CardsView } from '@/features/cards/views'

export const metadata: Metadata = {
  title: 'Card Database — Cartas do Digimon TCG',
  description:
    'Card database do Digimon Card Game: busque cartas por nome ou efeito, filtre por cor, tipo e set. Referência: digimoncard.dev.',
  alternates: { canonical: '/cartas' },
  openGraph: {
    title: 'Card Database — Cartas do Digimon TCG',
    description: 'Busque e filtre todas as cartas do Digimon Card Game.',
    type: 'website'
  }
}

export default function CartasPage() {
  return <CardsView />
}
