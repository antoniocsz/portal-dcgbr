// Path: apps/web/src/app/admin/anuncios/page.tsx
// Admin — Anúncios: curadoria de house ads, patrocínio direto e links de
// afiliado (CRUD + ativar/desativar). Somente administrator (a curadoria de
// anúncios é administrator-only na UI; o backend revalida) — mesmo gate de
// /admin/usuarios: editor que digitar a URL é redirecionado antes de renderizar.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/admin/model/session'
import { AdminAdsView } from '@/features/admin'

export const metadata: Metadata = { title: 'Anúncios', robots: { index: false } }

export default async function AdminAdsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  if (session.role !== 'administrator') redirect('/admin')

  return <AdminAdsView />
}
