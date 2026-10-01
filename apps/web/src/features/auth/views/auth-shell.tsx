// Path: apps/web/src/features/auth/views/auth-shell.tsx
// View: layout das páginas de auth — card centralizado (mobile) e
// duas colunas com painel de benefícios (desktop). Só JSX.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function AuthShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-4 py-6',
        'lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-12 lg:py-16'
      )}
    >
      <Card className="flex w-full max-w-[420px] flex-col gap-4 p-5 lg:gap-[18px] lg:p-8">
        {children}
      </Card>
      {aside}
    </div>
  )
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-display text-[22px] font-bold text-ink lg:text-[26px]">{title}</h1>
      <p className="text-[13px] text-ink-soft lg:text-sm">{subtitle}</p>
    </div>
  )
}

export function AuthDivider({ label }: { label?: string }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      {label ? <span className="hidden text-xs text-ink-faint lg:block">{label}</span> : null}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
