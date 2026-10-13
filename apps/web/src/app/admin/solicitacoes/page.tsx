// Path: apps/web/src/app/admin/solicitacoes/page.tsx
// Admin — Solicitações LGPD: fila de pedidos do titular (art. 18). O layout do
// painel já exige administrator|editor; o backend revalida cada ação.
import type { Metadata } from 'next'
import { AdminDataRequestsView } from '@/features/admin'

export const metadata: Metadata = { title: 'Solicitações LGPD', robots: { index: false } }

export default function AdminDataRequestsPage() {
  return <AdminDataRequestsView />
}
