// Path: apps/web/src/features/admin/views/admin-decks-view.tsx
// View do painel admin de decks (design "Admin — Decks"): cabeçalho, busca,
// filtro por status, tabela da agenda completa (rascunhos + published +
// unlisted) com paginação e exclusão admin real (administrator-only na UI;
// o backend revalida). Só JSX — dados e callbacks vêm do useAdminDecks.
'use client'

import Link from 'next/link'
import { Button, Card, StatusBadge } from '@/components'
import { cn } from '@/lib/utils'
import { AdminPageHeader } from './admin-page-header'
import { AdminTable } from './admin-table'
import type { AdminTableColumn } from './admin-table'
import { useAdminDecks, type AdminStatusFilter } from '../viewmodels/use-admin-decks'
import type { DeckSummary } from '@/features/decks/model/types'
import { STATUS_LABELS } from '@/features/decks/model/types'

const STATUS_FILTERS: { value: AdminStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'published', label: 'Publicados' }
]

export function AdminDecksView() {
  const vm = useAdminDecks()

  const columns: AdminTableColumn<DeckSummary>[] = [
    {
      key: 'name',
      header: 'Deck',
      render: (row) => (
        <Link href={`/decks/${row.slug}`} className="font-semibold text-ink hover:text-primary">
          {row.name}
        </Link>
      )
    },
    {
      key: 'format',
      header: 'Formato',
      render: (row) => <span className="text-ink-soft">{row.format}</span>
    },
    {
      key: 'owner',
      header: 'Dono',
      render: (row) => <span className="font-mono text-xs text-ink-faint">{row.ownerId}</span>
    },
    {
      key: 'cards',
      header: 'Cartas',
      render: (row) => <span className="text-ink-soft">{row.cardCount}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={row.status === 'published' ? 'success' : 'warning'}>
            {STATUS_LABELS[row.status]}
          </StatusBadge>
          {row.status === 'published' && !row.isPublic ? (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
              Unlisted
            </span>
          ) : null}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/decks/${row.slug}`}
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Ver →
          </Link>
          {vm.currentRole === 'administrator' ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={vm.isDeleting}
              onClick={() => vm.remove(row.slug)}
            >
              Excluir
            </Button>
          ) : null}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Decks"
        subtitle="Agenda completa de decks: rascunhos, publicados e unlisted. Excluir qualquer deck exige administrator — o backend revalida."
      />

      {vm.deleteError ? (
        <p role="alert" className="text-xs font-semibold text-danger">
          {vm.deleteError instanceof Error ? vm.deleteError.message : 'Falha ao excluir o deck.'}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Decks</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} decks</span>
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('search')
              vm.setSearch(typeof value === 'string' ? value.trim() : '')
            }}
          >
            <input
              type="search"
              name="search"
              defaultValue={vm.search}
              placeholder="Buscar deck…"
              aria-label="Buscar deck"
              className="h-9 w-full max-w-sm border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary placeholder:text-ink-faint"
            />
            <Button type="submit" variant="dark" size="sm">
              Buscar
            </Button>
          </form>

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
          emptyMessage={vm.isError ? 'Não foi possível carregar os decks.' : 'Nenhum deck encontrado.'}
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
