// Path: apps/web/src/app/admin/anuncios/page.tsx
// Admin — Anúncios: curadoria de house ads, patrocínio direto e links de
// afiliado (CRUD + ativar/desativar). O layout admin exige administrator/editor,
// mas a curadoria de anúncios é administrator-only na UI; o backend revalida.
import type { Metadata } from 'next'
import { AdminAdsView } from '@/features/admin'

export const metadata: Metadata = { title: 'Anúncios', robots: { index: false } }

export default function AdminAdsPage() {
  return <AdminAdsView />
}
