// Path: apps/web/src/features/tournaments/views/tournaments-list-view.tsx
// View da agenda de torneios: filtros por status (Todos/Próximos/Finalizados/
// Cancelados), lista com date box + status (TournamentCard do design system) e
// ação opcional no cabeçalho (ex: "+ Publicar torneio"). Estados de
// loading/erro/vazio. Nota: a API pública só expõe torneios publicados — o
// filtro por status tem efeito real para Admin/Editor e em "meus torneios".
'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Button, TournamentCard } from '@/components'
import { cn } from '@/lib/utils'
import type { TournamentStatus } from '../model/types'
import { toTournamentCardData } from '../viewmodels/tournament-view'
import { useTournamentList } from '../viewmodels/use-tournament-list'
import type { ListTournamentsParams } from '../viewmodels/use-tournament-list'

const STATUS_FILTERS: { value?: TournamentStatus; label: string }[] = [
  { label: 'Todos' },
  { value: 'published', label: 'Próximos' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' }
]

export interface TournamentsListViewProps {
  status?: TournamentStatus
  mine?: boolean
  title?: string
  description?: string
  emptyMessage?: string
  pageSize?: number
  headerAction?: ReactNode
}

export function TournamentsListView({
  status,
  mine = false,
  title = 'Torneios',
  description =
  'Agenda de torneios do Digimon TCG no Brasil: acompanhe os próximos ou publique o seu.',
  emptyMessage = 'Nenhum torneio encontrado.',
  pageSize = 20,
  headerAction
}: TournamentsListViewProps) {
  const pathname = usePathname()
  const params: ListTournamentsParams = { mine, pageSize }
  if (status) params.status = status
  const { tournaments, total, isLoading, isError, refetch } = useTournamentList(params)

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-6 text-ink-soft">{description}</p>
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </header>

      <nav className="flex flex-wrap items-center gap-3 pb-8" aria-label="Filtrar por status">
        <span className="text-[13px] font-bold text-ink">Filtrar:</span>
        {STATUS_FILTERS.map((filter) => {
          const active = filter.value === status
          const href = filter.value ? `${pathname}?status=${filter.value}` : pathname
          return (
            <Link
              key={filter.label}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'px-3.5 py-2 text-[13px] font-semibold transition-colors',
                active ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
              )}
            >
              {filter.label}
            </Link>
          )
        })}
      </nav>

      <p className="pb-4 text-[13px] text-ink-faint" aria-live="polite">
        {isLoading ? 'Carregando…' : `${total} torneios`}
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando torneios">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border border-border bg-surface p-4 sm:p-5"
            >
              <div className="size-14 shrink-0 animate-pulse bg-surface-2 sm:size-16" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
                <div className="h-3 w-1/3 animate-pulse bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">Não foi possível carregar os torneios.</p>
          <Button variant="dark" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/torneios/${tournament.slug}`}
              className="block transition-colors hover:border-primary/60"
            >
              <TournamentCard tournament={toTournamentCardData(tournament)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
