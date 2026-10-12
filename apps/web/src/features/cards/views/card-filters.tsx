// Path: apps/web/src/features/cards/views/card-filters.tsx
// View presentacional: barra de filtros do catálogo (busca + tipo + cor + custo
// + set). Sem estado próprio de filtros: recebe filtros/onChange do ViewModel.
// A lista de sets vem do ViewModel useCardSets e o filtro só aparece quando há
// sets cadastrados (o catálogo pode não ter nenhum ainda).
'use client'

import { cn } from '@/lib/utils'
import type { CardColor, CardType } from '../model/types'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '../model/types'
import { useCardSets, type CardFilters } from '../viewmodels'

const TYPES: CardType[] = ['digimon', 'option', 'tamer', 'digiegg']
const COLORS: CardColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white']
const PLAY_COSTS = [0, 1, 2, 3, 4, 5, 6, 7] as const

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

function togglePlayCost(filters: CardFilters, playCost: number): CardFilters {
  const next: CardFilters = { ...filters }
  if (next.playCost === playCost) delete next.playCost
  else next.playCost = playCost
  return next
}

function setSetCode(filters: CardFilters, setCode: string): CardFilters {
  const next: CardFilters = { ...filters }
  if (setCode) next.setCode = setCode
  else delete next.setCode
  return next
}

export function CardFilters({ filters, onChange }: CardFiltersProps) {
  const { sets } = useCardSets()

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

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por custo de jogo">
        <span className="text-[12px] font-bold text-ink-faint">Custo:</span>
        {PLAY_COSTS.map((cost) => (
          <button
            key={cost}
            type="button"
            aria-pressed={filters.playCost === cost}
            onClick={() => onChange(togglePlayCost(filters, cost))}
            className={cn(
              'min-w-9 px-3 py-1.5 text-[12px] font-semibold transition-colors',
              filters.playCost === cost ? 'bg-primary text-white' : 'bg-surface-2 text-ink hover:bg-surface'
            )}
          >
            {cost}
          </button>
        ))}
      </div>

      {sets.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="card-set-filter" className="text-[12px] font-bold text-ink-faint">
            Set:
          </label>
          <select
            id="card-set-filter"
            value={filters.setCode ?? ''}
            onChange={(event) => onChange(setSetCode(filters, event.target.value))}
            className="border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os sets</option>
            {sets.map((set) => (
              <option key={set.id} value={set.code}>
                {set.code}
                {set.name ? ` — ${set.name}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  )
}
