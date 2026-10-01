// Path: apps/web/src/features/cards/views/card-filters.tsx
// View presentacional: barra de filtros do catálogo (busca + tipo + cor).
// Sem estado próprio: recebe os filtros e o callback do ViewModel.
'use client'

import { cn } from '@/lib/utils'
import type { CardColor, CardType } from '../model/types'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '../model/types'
import type { CardFilters } from '../viewmodels'

const TYPES: CardType[] = ['digimon', 'option', 'tamer']
const COLORS: CardColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white']

export interface CardFiltersProps {
  filters: CardFilters
  onChange: (filters: CardFilters) => void
}

function toggleType(filters: CardFilters, type: CardType): CardFilters {
  const next: CardFilters = { ...filters }
  if (next.type === type) delete next.type
  else next.type = type
  return next
}

function toggleColor(filters: CardFilters, color: CardColor): CardFilters {
  const next: CardFilters = { ...filters }
  if (next.color === color) delete next.color
  else next.color = color
  return next
}

export function CardFilters({ filters, onChange }: CardFiltersProps) {
  return (
    <div className="flex flex-col gap-4 pb-6">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const value = new FormData(event.currentTarget).get('search')
          const search = typeof value === 'string' ? value.trim() : ''
          const next: CardFilters = { ...filters }
          if (search) next.search = search
          else delete next.search
          onChange(next)
        }}
      >
        <input
          type="search"
          name="search"
          defaultValue={filters.search ?? ''}
          placeholder="Buscar por nome ou efeito…"
          className="w-full border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Buscar cartas"
        />
        <button
          type="submit"
          className="shrink-0 bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={filters.type === type}
            onClick={() => onChange(toggleType(filters, type))}
            className={cn(
              'px-3 py-1.5 text-[12px] font-semibold transition-colors',
              filters.type === type ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
            )}
          >
            {CARD_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por cor">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            aria-pressed={filters.color === color}
            onClick={() => onChange(toggleColor(filters, color))}
            className={cn(
              'px-3 py-1.5 text-[12px] font-semibold transition-colors',
              filters.color === color ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
            )}
          >
            {CARD_COLOR_LABELS[color]}
          </button>
        ))}
      </div>
    </div>
  )
}
