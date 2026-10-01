// Path: apps/web/src/features/admin/views/admin-metrics.tsx
// View pura: grade de métricas do painel (reaproveita MetricCard do design system).
import { MetricCard } from '@/components'
import type { AdminMetric } from '../model/types'

export interface AdminMetricsProps {
  metrics: AdminMetric[]
}

export function AdminMetrics({ metrics }: AdminMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          trendTone={metric.trendTone ?? 'neutral'}
        />
      ))}
    </div>
  )
}
