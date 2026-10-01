// Path: apps/web/src/features/admin/views/admin-page-header.tsx
// View pura: cabeçalho das páginas do painel (título, subtítulo, ações).
import type { ReactNode } from 'react'

export interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[22px] font-bold text-ink lg:text-[26px]">{title}</h1>
        {subtitle ? <p className="text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  )
}
