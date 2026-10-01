// Path: apps/web/src/features/admin/views/admin-table.tsx
// View pura e genérica: tabela responsiva do painel — tabela no desktop e
// lista de cards no mobile. Recebe colunas + linhas; não conhece domínio.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface AdminTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  isLoading?: boolean
  loadingMessage?: string
}

export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Nenhum registro encontrado.',
  isLoading = false,
  loadingMessage = 'Carregando…'
}: AdminTableProps<T>) {
  if (isLoading) {
    return <p className="p-5 text-sm text-ink-faint">{loadingMessage}</p>
  }

  if (rows.length === 0) {
    return <p className="p-5 text-sm text-ink-faint">{emptyMessage}</p>
  }

  return (
    <>
      <table className="hidden w-full border-collapse lg:table">
        <thead>
          <tr className="bg-surface-2">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-5 py-3 text-left text-xs font-bold text-ink-soft', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-border">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('px-5 py-3 align-middle text-sm text-ink-soft', column.className)}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 p-4 lg:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="border border-border bg-surface">
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="text-[11px] font-bold uppercase text-ink-faint">{column.header}</span>
                <span className="text-right text-sm text-ink">{column.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}
