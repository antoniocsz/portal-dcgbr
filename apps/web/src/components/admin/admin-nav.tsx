// Path: apps/web/src/components/admin/admin-nav.tsx
// View pura: navegação do painel admin no mobile (chips). Sem hooks de dados.
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AdminNavItem } from './admin-sidebar'

export type AdminNavProps = {
  items: AdminNavItem[]
  activeHref: string
  className?: string
}

export function AdminNav({ items, activeHref, className }: AdminNavProps) {
  return (
    <nav className={cn('flex gap-1.5 overflow-x-auto px-4 py-3 lg:hidden', className)} aria-label="Painel administrativo">
      {items.map((item) => {
        const active = item.href === activeHref
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
              active ? 'bg-primary text-white' : 'bg-surface-2 text-ink-soft hover:text-ink'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
