// Path: apps/web/src/features/admin/views/admin-shell.tsx
// View do shell do painel: AdminSidebar (desktop) + AdminNav (mobile) com o
// item ativo derivado da rota. Estado de UI (pathname) — sem hooks de dados.
'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  AdminNav,
  AdminSidebar,
  Avatar,
  Copy,
  FileText,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Trophy,
  Users
} from '@/components'
import type { AdminNavItem } from '@/components'
import { LogoutButton } from '@/components/admin/logout-button'
import type { Role } from '@digimon/contracts'

const NAV_ITEMS: AdminNavItem[] = [
  { href: '/admin', label: 'Visão geral', icon: <LayoutDashboard className="size-4.5" /> },
  { href: '/admin/posts', label: 'Posts', icon: <FileText className="size-4.5" /> },
  { href: '/admin/cartas', label: 'Cartas', icon: <Layers className="size-4.5" /> },
  { href: '/admin/torneios', label: 'Torneios', icon: <Trophy className="size-4.5" /> },
  { href: '/admin/decks', label: 'Decks', icon: <Copy className="size-4.5" /> },
  { href: '/admin/comentarios', label: 'Comentários', icon: <MessageSquare className="size-4.5" /> },
  { href: '/admin/usuarios', label: 'Usuários', icon: <Users className="size-4.5" /> }
]

export interface AdminShellProps {
  user: { name: string; role: Role }
  isAdmin: boolean
  children: ReactNode
}

export function AdminShell({ user, isAdmin, children }: AdminShellProps) {
  const pathname = usePathname() ?? '/admin'
  const items = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.href !== '/admin/usuarios')

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar items={items} activeHref={pathname} user={user} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <span className="font-display text-lg font-bold text-ink">Painel</span>
          <div className="flex items-center gap-2">
            <Avatar name={user.name} tone="solid" />
            <LogoutButton variant="icon" />
          </div>
        </header>

        <AdminNav items={items} activeHref={pathname} />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
