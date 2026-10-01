// Path: apps/web/src/components/admin/admin-sidebar.tsx
// View pura: sidebar do painel admin (desktop). Sem hooks de dados.
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Layers } from '../icons'
import { Avatar } from '../ui/avatar'

export type AdminNavItem = {
  href: string
  label: string
  icon?: ReactNode
}

export type AdminUser = {
  name: string
  role: string
}

export type AdminSidebarProps = {
  items: AdminNavItem[]
  activeHref: string
  user: AdminUser
  className?: string
}

export function AdminSidebar({ items, activeHref, user, className }: AdminSidebarProps) {
  return (
    <aside className={cn('hidden w-64 shrink-0 flex-col gap-2 border-r border-border bg-surface p-5 lg:flex', className)}>
      <div className="flex items-center gap-2.5 pb-5">
        <span className="flex size-8 items-center justify-center bg-primary">
          <Layers className="size-4.5 text-white" />
        </span>
        <span className="font-display text-base font-bold text-ink">Painel</span>
      </div>

      <p className="text-[11px] font-bold uppercase text-ink-faint">Geral</p>

      <nav className="flex flex-col gap-1" aria-label="Painel administrativo">
        {items.map((item) => {
          const active = item.href === activeHref
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold transition-colors',
                active ? 'bg-primary text-white' : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
              )}
            >
              {item.icon ? <span className="[&>svg]:size-4.5">{item.icon}</span> : null}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 pt-3">
        <Avatar name={user.name} tone="solid" />
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-ink">{user.name}</span>
          <span className="text-[11px] text-ink-faint">{user.role}</span>
        </div>
      </div>
    </aside>
  )
}
