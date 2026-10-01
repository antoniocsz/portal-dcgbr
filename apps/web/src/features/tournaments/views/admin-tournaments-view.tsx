// Path: apps/web/src/features/tournaments/views/admin-tournaments-view.tsx
// View do painel admin de torneios (design "Admin — Torneios"): cabeçalho,
// filtros por status, tabela da agenda com ações (ver/cancelar). Só JSX —
// dados e callbacks vêm do useAdminTournaments.
'use client'

import Link from 'next/link'
import { Button, Card } from '@/components'
import { cn } from '@/lib/utils'
import { AdminPageHeader, AdminTable, type AdminTableColumn } from '@/features/admin'
import type { TournamentSummary } from '../model/types'
import { formatTournamentDate, statusLabel, statusTone } from '../viewmodels/tournament-view'
import { useAdminTournaments, type AdminStatusFilter } from '../viewmodels/use-admin-tournaments'
import { StatusBadge } from '@/components'

const STATUS_FILTERS: { value: AdminStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Próximos' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' }
]

export function AdminTournamentsView() {
  const vm = useAdminTournaments()

  const columns: AdminTableColumn<TournamentSummary>[] = [
    {
      key: 'name',
      header: 'Torneio',
      render: (row) => (
        <Link href={`/torneios/${row.slug}`} className="font-semibold text-ink hover:text-primary">
          {row.name}
        </Link>
      )
    },
    {
      key: 'date',
      header: 'Data',
      render: (row) => <span className="text-ink-soft">{formatTournamentDate(row.dateStart)}</span>
    },
    {
      key: 'meta',
      header: 'Formato · Local',
      render: (row) => (
        <span className="text-ink-soft">
          {row.format} · {row.location}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge tone={statusTone(row.status)}>{statusLabel(row.status)}</StatusBadge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/torneios/${row.slug}`}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Ver →
          </Link>
          {row.status === 'published' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.isCancelling}
              onClick={() => vm.cancel(row.slug)}
            >
              Cancelar
            </Button>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Torneios"
        subtitle="Gestão da agenda colaborativa: publique, filtre por status e cancele."
      />

      {vm.cancelError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.cancelError instanceof Error ? vm.cancelError.message : 'Falha ao cancelar o torneio.'}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Agenda</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} torneios</span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={vm.status === filter.value}
                onClick={() => vm.selectStatus(filter.value)}
                className={cn(
                  'px-3.5 py-2 text-[13px] font-semibold transition-colors',
                  vm.status === filter.value ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <AdminTable
          columns={columns}
          rows={vm.rows}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage={vm.isError ? 'Não foi possível carregar os torneios.' : 'Nenhum torneio encontrado.'}
        />

        {vm.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border p-4">
            <Button variant="dark" size="sm" disabled={vm.page <= 1} onClick={() => vm.setPage(vm.page - 1)}>
              ← Anterior
            </Button>
            <span className="text-[13px] text-ink-soft">
              Página <span className="font-semibold text-ink">{vm.page}</span> de {vm.totalPages}
            </span>
            <Button
              variant="dark"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage(vm.page + 1)}
            >
              Próxima →
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
