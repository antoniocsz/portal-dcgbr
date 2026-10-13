// Path: apps/web/src/features/admin/views/admin-data-requests-view.tsx
// View da fila admin de solicitações do titular (LGPD): tabela (tipo, nome,
// e-mail, mensagem, status, data) com filtro por status e ações de atendimento
// (Em andamento / Concluído / Rejeitado). Só JSX — dados e callbacks vêm de
// `useAdminDataRequests`. administrator|editor (o backend revalida).
'use client'

import { Button, Card, StatusBadge } from '@/components'
import type { StatusTone } from '@/components'
import { cn } from '@/lib/utils'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import {
  useAdminDataRequests,
  type AdminDataRequestsStatusFilter
} from '../viewmodels/use-admin-data-requests'
import {
  DATA_REQUEST_STATUSES,
  DATA_REQUEST_STATUS_LABELS,
  DATA_REQUEST_TYPE_LABELS,
  type DataRequestDTO,
  type DataRequestStatus
} from '@/features/privacy/model/types'

const STATUS_TONES: Record<DataRequestStatus, StatusTone> = {
  open: 'warning',
  in_progress: 'info',
  done: 'success',
  rejected: 'neutral'
}

const STATUS_FILTERS: { value: AdminDataRequestsStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...DATA_REQUEST_STATUSES.map((status) => ({
    value: status,
    label: DATA_REQUEST_STATUS_LABELS[status]
  }))
]

const TYPE_LABELS = DATA_REQUEST_TYPE_LABELS

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AdminDataRequestsView() {
  const vm = useAdminDataRequests()

  const columns: AdminTableColumn<DataRequestDTO>[] = [
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => <span className="text-ink-soft">{TYPE_LABELS[row.type]}</span>
    },
    {
      key: 'name',
      header: 'Nome',
      render: (row) => <span className="font-semibold text-ink">{row.name}</span>
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (row) => (
        <a href={`mailto:${row.email}`} className="text-accent hover:underline">
          {row.email}
        </a>
      )
    },
    {
      key: 'message',
      header: 'Mensagem',
      render: (row) => (
        <span className="line-clamp-2 block max-w-xs text-ink-soft" title={row.message}>
          {row.message}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge tone={STATUS_TONES[row.status]}>
          {DATA_REQUEST_STATUS_LABELS[row.status]}
        </StatusBadge>
      )
    },
    {
      key: 'createdAt',
      header: 'Data',
      render: (row) => <span className="text-ink-faint">{formatDateTime(row.createdAt)}</span>
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          {row.status !== 'in_progress' ? (
            <Button
              variant="dark"
              size="sm"
              disabled={vm.isUpdating}
              onClick={() => vm.updateStatus({ id: row.id, next: 'in_progress' })}
            >
              Em andamento
            </Button>
          ) : null}
          {row.status !== 'done' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.isUpdating}
              onClick={() => {
                if (window.confirm('Marcar esta solicitação como concluída?')) {
                  vm.updateStatus({ id: row.id, next: 'done' })
                }
              }}
            >
              Concluído
            </Button>
          ) : null}
          {row.status !== 'rejected' ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:text-danger"
              disabled={vm.isUpdating}
              onClick={() => {
                if (window.confirm('Rejeitar esta solicitação?')) {
                  vm.updateStatus({ id: row.id, next: 'rejected' })
                }
              }}
            >
              Rejeitado
            </Button>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Solicitações LGPD"
        subtitle="Fila de pedidos do titular (art. 18): acesso, correção, eliminação, portabilidade e revogação. O backend revalida cada ação."
      />

      {vm.updateError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.updateError instanceof Error
            ? vm.updateError.message
            : 'Não foi possível atualizar o status.'}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Solicitações</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} solicitações</span>
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
                  vm.status === filter.value
                    ? 'bg-primary text-white'
                    : 'bg-surface-2 text-ink hover:bg-surface'
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
          emptyMessage={
            vm.isError
              ? 'Não foi possível carregar as solicitações.'
              : 'Nenhuma solicitação encontrada.'
          }
        />

        {vm.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border p-4">
            <Button
              variant="dark"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.setPage(vm.page - 1)}
            >
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
