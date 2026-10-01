// Path: apps/web/src/features/admin/views/admin-comments-view.tsx
// View de Comentários: cabeçalho, métricas, tabela de comentários recentes e
// fila de moderação. Só JSX — dados e callbacks vêm dos ViewModels.
'use client'

import { Button, Card } from '@/components'
import { AdminCommentBadge } from './admin-badge'
import { AdminMetrics } from './admin-metrics'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import { ModerationQueue } from './moderation-queue'
import { useAdminCommentsViewModel } from '../viewmodels/use-admin-comments-view-model'
import { useAdminModerationViewModel } from '../viewmodels/use-admin-moderation-view-model'
import type { AdminCommentRow } from '../model/types'

export function AdminCommentsView() {
  const vm = useAdminCommentsViewModel()
  const moderation = useAdminModerationViewModel()

  const columns: AdminTableColumn<AdminCommentRow>[] = [
    {
      key: 'body',
      header: 'Comentário',
      render: (row) => <span className="font-semibold text-ink">{row.body}</span>
    },
    { key: 'status', header: 'Status', render: (row) => <AdminCommentBadge status={row.status} /> },
    { key: 'author', header: 'Autor', render: (row) => <span>{row.authorName}</span> },
    { key: 'date', header: 'Data', render: (row) => <span className="text-ink-faint">{row.date}</span> },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.moderate(row.id, 'hide')}
            disabled={vm.isBusy || row.status === 'hidden'}
          >
            Ocultar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => vm.moderate(row.id, 'show')}
            disabled={vm.isBusy || row.status === 'visible'}
          >
            Exibir
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Comentários"
        subtitle="Modere os comentários da comunidade."
        actions={<Button variant="dark" size="sm">Exportar</Button>}
      />

      <AdminMetrics metrics={vm.metrics} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-ink">Comentários recentes</h2>
          <span className="text-[13px] text-ink-faint">{vm.total} comentários</span>
        </div>
        <AdminTable columns={columns} rows={vm.comments} rowKey={(row) => row.id} />
      </Card>

      <ModerationQueue
        title="Fila de moderação"
        items={moderation.items}
        onHide={moderation.hide}
        onKeep={moderation.keep}
        busyId={moderation.moderatingId}
      />
    </div>
  )
}
