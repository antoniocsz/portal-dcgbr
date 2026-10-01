// Path: apps/web/src/app/admin/torneios/page.tsx
// Admin — Torneios: gestão da agenda (filtros por status + cancelamento).
// O layout admin exige administrator/editor; o backend revalida cada ação.
import type { Metadata } from 'next'
import { AdminTournamentsView } from '@/features/tournaments/views'

export const metadata: Metadata = { title: 'Torneios' }

export default function AdminTorneiosPage() {
  return <AdminTournamentsView />
}
