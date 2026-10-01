// Path: apps/web/src/components/ui/status-badge.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const TONES: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-accent',
  neutral: 'bg-ink-faint'
}

export type StatusBadgeProps = {
  tone?: StatusTone
  className?: string
  children: ReactNode
}

export function StatusBadge({ tone = 'neutral', className, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 bg-surface-2 px-2.5 py-[5px] text-xs font-semibold text-ink-soft',
        className
      )}
    >
      <span className={cn('size-2 rounded-full', TONES[tone])} aria-hidden="true" />
      {children}
    </span>
  )
}
