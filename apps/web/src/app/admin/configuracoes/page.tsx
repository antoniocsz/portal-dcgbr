// Path: apps/web/src/app/admin/configuracoes/page.tsx
// Configurações do portal — somente administrator (backend revalida via role).
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/admin/model/session'
import { getSiteGate } from '@/lib/server/site-gate'
import { SiteSettingsView } from '@/features/admin/views/site-settings-view'

export const metadata: Metadata = { title: 'Configurações' }

export default async function AdminConfiguracoesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  if (session.role !== 'administrator') redirect('/admin')

  const mode = await getSiteGate()

  return <SiteSettingsView initialMode={mode} />
}
