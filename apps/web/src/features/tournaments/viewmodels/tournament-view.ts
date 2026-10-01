// Path: apps/web/src/features/tournaments/viewmodels/tournament-view.ts
// Helpers de apresentação (sem hooks, sem JSX): mapeiam DTOs da API para props
// das Views — date box + status do TournamentCard do design system.
import type { StatusTone, TournamentCardData } from '@/components'
import type { TournamentStatus, TournamentSummary } from '../model/types'
import { STATUS_LABELS } from '../model/types'

export function statusTone(status: TournamentStatus): StatusTone {
  switch (status) {
    case 'published':
      return 'info'
    case 'cancelled':
      return 'danger'
    case 'finished':
      return 'neutral'
  }
}

export function statusLabel(status: TournamentStatus): string {
  return STATUS_LABELS[status]
}

export function toTournamentCardData(summary: TournamentSummary): TournamentCardData {
  const date = new Date(summary.dateStart)
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(date)
    .replace('.', '')
  return {
    name: summary.name,
    day: String(date.getDate()).padStart(2, '0'),
    month,
    format: summary.format,
    city: summary.location,
    status: { label: statusLabel(summary.status), tone: statusTone(summary.status) }
  }
}

export function formatTournamentDate(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))
}
