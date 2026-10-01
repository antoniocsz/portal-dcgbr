// Path: apps/web/src/features/admin/views/admin-dashboard-view.tsx
// View do Painel: cabeçalho, métricas, tabela de posts (workflow editorial) e
// moderação de comentários. Só JSX — dados e callbacks vêm dos ViewModels.
'use client'

import { Button, Card } from '@/components'
import { AdminPostBadge } from './admin-badge'
import { AdminMetrics } from './admin-metrics'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import { ModerationQueue } from './moderation-queue'
import { useAdminDashboardViewModel } from '../viewmodels/use-admin-dashboard-view-model'
import { useAdminModerationViewModel } from '../viewmodels/use-admin-moderation-view-model'
import type { AdminPostRow } from '../model/types'

export function AdminDashboardView() {
  const vm = useAdminDashboardViewModel()
  const moderation = useAdminModerationViewModel()

  const columns: AdminTableColumn<AdminPostRow>[] = [
    {
      key: 'title',
      header: 'Título',
      render: (row) => <span className="font-semibold text-ink">{row.title}</span>
    },
    { key: 'status', header: 'Status', render: (row) => <AdminPostBadge status={row.status} /> },
    { key: 'author', header: 'Autor', render: (row) => <span>{row.authorId}</span> },
    { key: 'date', header: 'Data', render: (row) => <span className="text-ink-faint">{row.date}</span> },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.publish(row.id)}
            disabled={vm.busyId === row.id}
          >
            Publicar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.archive(row.id)}
            disabled={vm.busyId === row.id}
          >
            Arquivar
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Visão geral"
        subtitle="Acompanhe o workflow editorial e a moderação."
        actions={<Button variant="dark" size="sm">Exportar</Button>}
      />

      {vm.error ? <p className="text-sm text-danger">{vm.error}</p> : null}

      <AdminMetrics metrics={vm.metrics} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-ink">Posts — workflow editorial</h2>
          <span className="text-[13px] text-ink-faint">draft → review → published</span>
        </div>
        <AdminTable
          columns={columns}
          rows={vm.posts}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage="Nenhum post encontrado."
        />
      </Card>

      <ModerationQueue
        title="Moderação de comentários"
        items={moderation.items}
        onHide={moderation.hide}
        onKeep={moderation.keep}
        busyId={moderation.moderatingId}
      />
    </div>
  )
}
