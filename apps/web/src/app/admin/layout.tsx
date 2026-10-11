// Path: apps/web/src/app/admin/layout.tsx
// Layout do painel: exige sessão com papel administrator ou editor (o backend
// revalida cada ação). Monta o AdminShell (sidebar desktop / nav mobile).
// Sessão validada no servidor; nome do usuário vem da API (GET /auth/me).
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { fetchCurrentUser, getAdminSession } from '@/features/admin/model/session'
import { AdminShell } from '@/features/admin/views/admin-shell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  if (session.role !== 'administrator' && session.role !== 'editor') redirect('/')

  const profile = await fetchCurrentUser()
  const name = profile?.name ?? 'Usuário'

  return (
    <AdminShell user={{ name, role: session.role }} isAdmin={session.role === 'administrator'}>
      {children}
    </AdminShell>
  )
}
