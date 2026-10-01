// Path: apps/web/src/app/admin/layout.tsx
// Layout do painel: exige sessão com papel administrator ou editor (o backend
// revalida cada ação). Monta o AdminShell (sidebar desktop / nav mobile).
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { GetProfileUseCase } from '@digimon/users'
import { usersDeps } from '@/lib/server/container'
import { getAdminSession } from '@/features/admin/model/session'
import { AdminShell } from '@/features/admin/views/admin-shell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession()
  if (!session) redirect('/login')
  if (session.role !== 'administrator' && session.role !== 'editor') redirect('/')

  let name = 'Usuário'
  try {
    const profile = await new GetProfileUseCase(usersDeps()).execute(session.userId)
    name = profile.name
  } catch {
    // perfil indisponível: mantém o rótulo padrão na sidebar
  }

  return (
    <AdminShell user={{ name, role: session.role }} isAdmin={session.role === 'administrator'}>
      {children}
    </AdminShell>
  )
}
