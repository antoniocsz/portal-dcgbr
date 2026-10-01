// Path: apps/web/src/features/cards/views/admin-cards-view.tsx
// View do painel admin de cartas (design "Admin — Cartas"): cabeçalho, busca,
// tabela do catálogo com paginação e painel de importação JSON. Só JSX —
// dados e callbacks vêm do useAdminCards.
'use client'

import Link from 'next/link'
import { Button, Card, StatusBadge } from '@/components'
import { cn } from '@/lib/utils'
import type { AdminCardRow, CardColor, CardType } from '../model/types'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '../model/types'
import { AdminPageHeader, AdminTable, type AdminTableColumn } from '@/features/admin'
import { useAdminCards, type AdminCardFilters } from '../viewmodels/use-admin-cards'

const TYPE_FILTERS = ['digimon', 'option', 'tamer'] as const
const COLOR_FILTERS = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white'] as const

function toggleType(filters: AdminCardFilters, type: CardType): AdminCardFilters {
  const next = { ...filters }
  if (next.type === type) delete next.type
  else next.type = type
  return next
}

function toggleColor(filters: AdminCardFilters, color: CardColor): AdminCardFilters {
  const next = { ...filters }
  if (next.color === color) delete next.color
  else next.color = color
  return next
}

function ColorDots({ colors }: { colors: AdminCardRow['colors'] }) {
  const hex: Record<string, string> = {
    red: '#dc2626',
    blue: '#3b82f6',
    yellow: '#e5b93b',
    green: '#22c55e',
    purple: '#a855f7',
    black: '#3a3f4a',
    white: '#ffffff'
  }
  return (
    <span className="flex items-center gap-1">
      {colors.map((color) => (
        <span
          key={color}
          className="size-2.5 rounded-full"
          style={{ backgroundColor: hex[color] }}
          aria-label={CARD_COLOR_LABELS[color]}
        />
      ))}
    </span>
  )
}

export function AdminCardsView({ canImport = true }: { canImport?: boolean }) {
  const vm = useAdminCards()

  const columns: AdminTableColumn<AdminCardRow>[] = [
    {
      key: 'name',
      header: 'Carta',
      render: (row) => (
        <Link
          href={`/cartas/${row.id}`}
          className="font-semibold text-ink hover:text-primary"
        >
          {row.name}
          <span className="ml-2 font-normal text-ink-faint">{row.number}</span>
        </Link>
      )
    },
    {
      key: 'color',
      header: 'Cor',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <ColorDots colors={row.colors} />
          <span className="text-ink-soft">{row.colors.map((c) => CARD_COLOR_LABELS[c]).join(' / ')}</span>
        </span>
      )
    },
    {
      key: 'set',
      header: 'Set',
      render: (row) => <span className="text-ink-soft">{row.setCode ?? '—'}</span>
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => (
        <StatusBadge tone={row.type === 'digimon' ? 'info' : row.type === 'tamer' ? 'success' : 'neutral'}>
          {CARD_TYPE_LABELS[row.type]}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (row) => (
        <Link
          href={`/cartas/${row.id}`}
          className="text-[13px] font-semibold text-primary hover:underline"
        >
          Ver ficha →
        </Link>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-8">
      <AdminPageHeader
        title="Cartas"
        subtitle="Catálogo do card database e importação/curadoria (somente administrator)."
        actions={
          canImport ? (
            <Button variant="dark" size="sm" onClick={vm.toggleImport} aria-expanded={vm.importOpen}>
              {vm.importOpen ? 'Fechar importação' : 'Importar JSON'}
            </Button>
          ) : undefined
        }
      />

      {canImport && vm.importOpen ? (
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="font-display text-lg font-bold text-ink">Importação / curadoria</h2>
          <p className="text-[13px] leading-5 text-ink-soft">
            Cole o JSON com <code className="text-primary">{'{ "cards": [...] }'}</code> (e
            opcionalmente <code className="text-primary">sets</code>). Cartas com{' '}
            <code className="text-primary">dcgId</code> existente são atualizadas.
          </p>
          <textarea
            value={vm.importJson}
            onChange={(event) => vm.setImportJson(event.target.value)}
            rows={10}
            spellCheck={false}
            aria-label="JSON de importação"
            placeholder='{\n  "cards": [\n    { "dcgId": "bt16-051", "name": "Agumon", "number": "BT16-051", "rarity": "R", "type": "digimon", "colors": ["red"], "level": 2, "dp": 3000, "playCost": 0 }\n  ]\n}'
            className="w-full border border-border bg-surface-2 px-3 py-2.5 font-mono text-xs text-ink outline-none focus:border-primary"
          />
          {vm.importDraftError ? (
            <p role="alert" className="text-xs font-semibold text-danger">
              {vm.importDraftError}
            </p>
          ) : null}
          {vm.importError ? (
            <p role="alert" className="text-xs font-semibold text-danger">
              {vm.importError instanceof Error ? vm.importError.message : 'Falha na importação.'}
            </p>
          ) : null}
          {vm.importResult ? (
            <p className="text-sm font-semibold text-success">
              Importação concluída: {vm.importResult.imported} novas · {vm.importResult.updated}{' '}
              atualizadas · {vm.importResult.sets} sets.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={vm.runImport}
              disabled={vm.isImporting}
            >
              {vm.isImporting ? 'Importando…' : 'Importar'}
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={vm.resetImport}
              disabled={vm.isImporting}
            >
              Limpar
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">Catálogo de cartas</h2>
            <span className="text-[13px] text-ink-faint">{vm.total} cartas</span>
          </div>

          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              const value = new FormData(event.currentTarget).get('search')
              vm.setFilters({ ...vm.filters, search: typeof value === 'string' ? value.trim() : '' })
            }}
          >
            <input
              type="search"
              name="search"
              defaultValue={vm.filters.search ?? ''}
              placeholder="Buscar carta…"
              aria-label="Buscar carta no catálogo"
              className="h-9 w-full max-w-sm border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary placeholder:text-ink-faint"
            />
            <Button type="submit" variant="dark" size="sm">
              Buscar
            </Button>
          </form>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={vm.filters.type === type}
                onClick={() => vm.setFilters(toggleType(vm.filters, type))}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold transition-colors',
                  vm.filters.type === type ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
                )}
              >
                {CARD_TYPE_LABELS[type]}
              </button>
            ))}
            {COLOR_FILTERS.map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={vm.filters.color === color}
                onClick={() => vm.setFilters(toggleColor(vm.filters, color))}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold transition-colors',
                  vm.filters.color === color ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
                )}
              >
                {CARD_COLOR_LABELS[color]}
              </button>
            ))}
          </div>
        </div>

        <AdminTable
          columns={columns}
          rows={vm.rows}
          rowKey={(row) => row.id}
          isLoading={vm.isLoading}
          emptyMessage={vm.isError ? 'Não foi possível carregar o catálogo.' : 'Nenhuma carta encontrada.'}
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
