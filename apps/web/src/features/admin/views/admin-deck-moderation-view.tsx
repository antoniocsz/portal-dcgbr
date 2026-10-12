// Path: apps/web/src/features/admin/views/admin-deck-moderation-view.tsx
// View da moderação de decks da comunidade: tabela da fila de reportes
// (deck, autor, status, nº de reportes, último reporte) com ações Hide/Restore
// e "dispensar reportes", além do painel de reportes abertos por deck. Só JSX —
// dados e callbacks vêm de `useAdminDeckModeration`.
'use client'

import { Button, Card, StatusBadge } from '@/components'
import type { StatusTone } from '@/components'
import {
  COMMUNITY_STATUS_LABELS,
  type CommunityDeckStatus
} from '@/features/decks/model/community-types'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import { useAdminDeckModeration } from '../viewmodels/use-admin-deck-moderation'
import type { ReportedCommunityDeck } from '../model/deck-moderation-api'

const STATUS_TONES: Record<CommunityDeckStatus, StatusTone> = {
  public: 'success',
  hidden: 'warning',
  unpublished: 'neutral'
}

const REPORT_REASON_LABELS: Record<string, string> = {
  inappropriate: 'Conteúdo inapropriado',
  spam: 'Spam',
  copyright: 'Direitos autorais',
  other: 'Outro'
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AdminDeckModerationView() {
  const vm = useAdminDeckModeration()

  const columns: AdminTableColumn<ReportedCommunityDeck>[] = [
    {
      key: 'deck',
      header: 'Deck',
      render: (row) => <span className="font-semibold text-ink">{row.name}</span>
    },
    {
      key: 'owner',
      header: 'Autor',
      render: (row) => <span className="text-ink-soft">{row.ownerName}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge tone={STATUS_TONES[row.status]}>
          {COMMUNITY_STATUS_LABELS[row.status]}
        </StatusBadge>
      )
    },
    {
      key: 'reportCount',
      header: 'Reportes',
      render: (row) => <span className="font-semibold text-ink">{row.reportCount}</span>
    },
    {
      key: 'lastReportedAt',
      header: 'Último reporte',
      render: (row) => <span className="text-ink-faint">{formatDateTime(row.lastReportedAt)}</span>
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="dark" size="sm" onClick={() => vm.openDeck(row.publicDeckId)}>
            Ver reportes
          </Button>
          {row.status === 'hidden' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.busy}
              onClick={() => vm.moderate({ publicDeckId: row.publicDeckId, action: 'restore' })}
            >
              Restaurar
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.busy}
              className="text-danger hover:text-danger"
              onClick={() => {
                if (window.confirm(`Ocultar "${row.name}"? Os reportes abertos serão dispensados.`)) {
                  vm.moderate({ publicDeckId: row.publicDeckId, action: 'hide' })
                }
              }}
            >
              Ocultar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={vm.busy}
            onClick={() => {
              if (window.confirm(`Dispensar os reportes de "${row.name}"?`)) {
                vm.dismiss(row.publicDeckId)
              }
            }}
          >
            Dispensar
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Moderação de decks"
        subtitle="Fila de reportes da comunidade. Ocultar remove o deck do feed e fecha os reportes abertos; o backend revalida cada ação."
      />

      {vm.actionError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.actionError instanceof Error
            ? vm.actionError.message
            : 'Não foi possível concluir a ação.'}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-bold text-ink">Fila de reportes</h2>
          <span className="text-[13px] text-ink-faint">{vm.rows.length} decks</span>
        </div>

        <AdminTable
          columns={columns}
          rows={vm.rows}
          rowKey={(row) => row.publicDeckId}
          isLoading={vm.isLoading}
          emptyMessage={
            vm.isError ? 'Não foi possível carregar a fila.' : 'Nenhum deck reportado.'
          }
        />
      </Card>

      {vm.selectedDeck ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-5">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-lg font-bold text-ink">Reportes abertos</h2>
              <p className="text-sm text-ink-soft">{vm.selectedDeck.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={vm.closeDeck}>
              Fechar
            </Button>
          </div>

          {vm.isLoadingReports ? (
            <p className="p-5 text-sm text-ink-faint">Carregando…</p>
          ) : vm.reportsError ? (
            <p className="p-5 text-sm text-ink-faint">Não foi possível carregar os reportes.</p>
          ) : vm.openReports.length === 0 ? (
            <p className="p-5 text-sm text-ink-faint">Nenhum reporte aberto para este deck.</p>
          ) : (
            <ul className="flex flex-col">
              {vm.openReports.map((report) => (
                <li key={report.id} className="border-b border-border p-5 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">
                      {REPORT_REASON_LABELS[report.reason] ?? report.reason}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {formatDateTime(report.createdAt)}
                    </span>
                  </div>
                  {report.details ? (
                    <p className="mt-2 text-sm text-ink-soft">{report.details}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  )
}
