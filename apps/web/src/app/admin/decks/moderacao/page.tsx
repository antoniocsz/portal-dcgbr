// Path: apps/web/src/app/admin/decks/moderacao/page.tsx
// Admin — Moderação de decks: fila de reportes da comunidade (hide/restore e
// dispensar). O layout admin exige administrator/editor; o backend revalida.
import type { Metadata } from 'next'
import { AdminDeckModerationView } from '@/features/admin'

export const metadata: Metadata = { title: 'Moderação de decks' }

export default function AdminDeckModerationPage() {
  return <AdminDeckModerationView />
}
