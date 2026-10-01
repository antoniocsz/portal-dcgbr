// Path: apps/web/src/app/admin/page.tsx
// Painel administrativo — visão geral (métricas + posts + moderação).
import type { Metadata } from 'next'
import { AdminDashboardView } from '@/features/admin/views/admin-dashboard-view'

export const metadata: Metadata = { title: 'Painel' }

export default function AdminDashboardPage() {
  return <AdminDashboardView />
}
