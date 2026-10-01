// Path: apps/web/src/app/admin/cartas/page.tsx
// Admin — Cartas: catálogo do card database + importação/curadoria.
// Somente administrator importa (o backend revalida); editor vê o catálogo.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/admin/model/session'
import { AdminCardsView } from '@/features/cards/views'

export const metadata: Metadata = { title: 'Cartas' }

export default async function AdminCartasPage() {
  const session = await getAdminSession()
  if (!session) redirect('/login')

  return <AdminCardsView canImport={session.role === 'administrator'} />
}
