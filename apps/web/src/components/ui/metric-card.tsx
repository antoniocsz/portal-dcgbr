// Path: apps/web/src/components/ui/metric-card.tsx
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TREND_TONES: Record<'success' | 'warning' | 'neutral', string> = {
  success: 'text-success',
  warning: 'text-warning',
  neutral: 'text-ink-faint'
}

export type MetricCardProps = {
  label: string
  value: ReactNode
  trend?: ReactNode
  trendTone?: 'success' | 'warning' | 'neutral'
  className?: string
}

export function MetricCard({ label, value, trend, trendTone = 'neutral', className }: MetricCardProps) {
  return (
    <div className={cn('flex flex-col gap-2 border border-border bg-surface p-4 sm:p-5', className)}>
      <span className="text-[13px] text-ink-soft">{label}</span>
      <span className="font-display text-2xl font-bold leading-none text-ink sm:text-3xl">{value}</span>
      {trend ? <span className={cn('text-xs font-semibold', TREND_TONES[trendTone])}>{trend}</span> : null}
    </div>
  )
}
