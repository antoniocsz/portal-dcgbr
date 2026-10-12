// Path: apps/web/src/features/cards/views/card-filters.tsx
// View presentacional: barra de filtros do catálogo (busca + selects de tipo,
// cor, custo e set). Sem estado próprio de filtros: recebe filtros/onChange do
// ViewModel. A lista de sets vem do ViewModel useCardSets e o filtro só aparece
// quando há sets cadastrados (o catálogo pode não ter nenhum ainda).
'use client'

import type { CardColor, CardType, ListCardsParams } from '../model/types'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '../model/types'
import { useCardSets, type CardFilters } from '../viewmodels'

const TYPES: CardType[] = ['digimon', 'option', 'tamer', 'digiegg']
const COLORS: CardColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white']
const COST_RANGE = ['0', '1', '2', '3', '4', '5', '6', '7+'] as const

const SELECT_CLASS =
  'border border-border bg-surface px-3 py-2 text-[13px] font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-primary'
const LABEL_CLASS = 'text-[12px] font-bold text-ink-faint'

/** Filtros da View: `CardFilters` (ViewModel) + faixa de custo (Model). */
type FilterState = CardFilters & Pick<ListCardsParams, 'minPlayCost' | 'maxPlayCost'>

export interface CardFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

function setType(filters: FilterState, value: string): FilterState {
  const next: FilterState = { ...filters }
  if (value) next.type = value as CardType
  else delete next.type
  return next
}

function setColor(filters: FilterState, value: string): FilterState {
  const next: FilterState = { ...filters }
  if (value) next.color = value as CardColor
  else delete next.color
  return next
}

/** Valor do select de custo derivado da faixa (0–6 exatos ou "7+"). */
function costValue(filters: FilterState): string {
  if (filters.minPlayCost === 7 && filters.maxPlayCost === undefined) return '7+'
  if (filters.minPlayCost !== undefined && filters.minPlayCost === filters.maxPlayCost) {
    return String(filters.minPlayCost)
  }
  if (filters.maxPlayCost !== undefined && filters.minPlayCost === undefined) {
    return String(filters.maxPlayCost)
  }
  return ''
}

/** "7+" → minPlayCost=7; 0–6 → min=max=<n>; vazio → remove a faixa. */
function setPlayCost(filters: FilterState, value: string): FilterState {
  const next: FilterState = { ...filters }
  delete next.minPlayCost
  delete next.maxPlayCost
  if (value === '7+') {
    next.minPlayCost = 7
  } else if (value) {
    const cost = Number(value)
    next.minPlayCost = cost
    next.maxPlayCost = cost
  }
  return next
}

function setSetCode(filters: FilterState, value: string): FilterState {
  const next: FilterState = { ...filters }
  if (value) next.setCode = value
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
          const next: FilterState = { ...filters }
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

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-type-filter" className={LABEL_CLASS}>
            Tipo
          </label>
          <select
            id="card-type-filter"
            value={filters.type ?? ''}
            onChange={(event) => onChange(setType(filters, event.target.value))}
            className={SELECT_CLASS}
          >
            <option value="">Todos os tipos</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {CARD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-color-filter" className={LABEL_CLASS}>
            Cor
          </label>
          <select
            id="card-color-filter"
            value={filters.color ?? ''}
            onChange={(event) => onChange(setColor(filters, event.target.value))}
            className={SELECT_CLASS}
          >
            <option value="">Todas as cores</option>
            {COLORS.map((color) => (
              <option key={color} value={color}>
                {CARD_COLOR_LABELS[color]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="card-cost-filter" className={LABEL_CLASS}>
            Custo
          </label>
          <select
            id="card-cost-filter"
            value={costValue(filters)}
            onChange={(event) => onChange(setPlayCost(filters, event.target.value))}
            className={SELECT_CLASS}
          >
            <option value="">Todos os custos</option>
            {COST_RANGE.map((cost) => (
              <option key={cost} value={cost}>
                {cost}
              </option>
            ))}
          </select>
        </div>

        {sets.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="card-set-filter" className={LABEL_CLASS}>
              Set
            </label>
            <select
              id="card-set-filter"
              value={filters.setCode ?? ''}
              onChange={(event) => onChange(setSetCode(filters, event.target.value))}
              className={SELECT_CLASS}
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
    </div>
  )
}
