// Path: apps/web/src/app/admin/decks/page.tsx
// Admin — Decks: gestão dos decks publicados da comunidade (busca + exclusão
// de autoria própria). O layout admin exige administrator/editor; o backend
// revalida cada ação (a API de decks é owner-only, sem rota admin dedicada).
import type { Metadata } from 'next'
import { AdminDecksView } from '@/features/admin'

export const metadata: Metadata = { title: 'Decks' }

export default function AdminDecksPage() {
  return <AdminDecksView />
}
