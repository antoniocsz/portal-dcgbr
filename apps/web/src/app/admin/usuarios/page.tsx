// Path: apps/web/src/app/admin/usuarios/page.tsx
// Gestão de usuários — somente administrator (frontend esconde; backend revalida).
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAdminSession } from '@/features/admin/model/session'
import { AdminUsersView } from '@/features/users/views/admin-users-view'

export const metadata: Metadata = { title: 'Usuários' }

export default async function AdminUsersPage() {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  if (session.role !== 'administrator') redirect('/admin')

  return <AdminUsersView />
}
