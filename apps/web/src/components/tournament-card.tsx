// Path: apps/web/src/components/tournament-card.tsx
// View pura: card de torneio (data + formato/local + status). Sem hooks de dados.
import { cn } from '@/lib/utils'
import { MapPin } from './icons'
import { StatusBadge, type StatusTone } from './ui/status-badge'

export type TournamentCardData = {
  name: string
  day: string
  month: string
  format?: string
  city?: string
  status?: { label: string; tone: StatusTone }
}

export type TournamentCardProps = {
  tournament: TournamentCardData
  className?: string
}

export function TournamentCard({ tournament, className }: TournamentCardProps) {
  return (
    <article className={cn('flex items-center gap-4 border border-border bg-surface p-4 sm:p-5', className)}>
      <div className="flex size-14 shrink-0 flex-col items-center justify-center bg-primary-soft sm:size-16">
        <span className="font-display text-xl font-bold text-primary sm:text-[22px]">{tournament.day}</span>
        <span className="text-[10px] font-bold uppercase text-primary sm:text-[11px]">{tournament.month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="truncate font-display text-base font-bold text-ink">{tournament.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-soft">
          {tournament.format ? <span className="font-semibold">{tournament.format}</span> : null}
          {tournament.city ? (
            <span className="inline-flex items-center gap-1 text-ink-faint">
              <MapPin className="size-3.5" />
              {tournament.city}
            </span>
          ) : null}
        </div>
        {tournament.status ? (
          <StatusBadge tone={tournament.status.tone}>{tournament.status.label}</StatusBadge>
        ) : null}
      </div>
    </article>
  )
}
