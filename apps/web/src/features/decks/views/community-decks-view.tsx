// Path: apps/web/src/features/decks/views/community-decks-view.tsx
// View do feed da comunidade: filtros (sort/período/cores) + busca + grid de
// DeckCard com like e contadores. Estados loading/erro/vazio + paginação.
'use client'

import Link from 'next/link'
import { ATTRIBUTE_COLORS, ATTRIBUTE_LABELS, Button, DeckCard } from '@/components'
import type { AttributeColor } from '@/components'
import {
  COMMUNITY_COLORS,
  COMMUNITY_PERIOD_LABELS,
  COMMUNITY_SORT_LABELS
} from '../model/community-types'
import { toCommunityDeckCardData } from '../viewmodels/deck-view'
import { useCommunityDecks } from '../viewmodels/use-community-decks'

const SORTS = ['top', 'new'] as const
const PERIODS = ['week', 'month', 'all'] as const

export function CommunityDecksView() {
  const vm = useCommunityDecks()

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Comunidade
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Descubra, curta e copie decks publicados pela comunidade. Cada deck mostra likes, cópias
          e se a composição está legal.
        </p>
        <nav className="flex gap-2 pt-1 text-sm" aria-label="Seções de decks">
          <Link href="/decks" className="text-ink-soft hover:text-ink hover:underline">
            Meus decks
          </Link>
          <span aria-hidden="true" className="text-ink-faint">
            ·
          </span>
          <span className="font-semibold text-ink">Comunidade</span>
        </nav>
      </header>

      <section aria-label="Filtros" className="flex flex-col gap-4 border border-border bg-surface p-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const value = new FormData(event.currentTarget).get('q')
            vm.setSearch(typeof value === 'string' ? value.trim() : '')
          }}
        >
          <input
            key={vm.filters.search}
            type="search"
            name="q"
            defaultValue={vm.filters.search}
            placeholder="Buscar por nome ou autor…"
            aria-label="Buscar decks da comunidade"
            className="h-10 min-w-0 flex-1 border border-border bg-surface-2 px-3 text-sm text-ink outline-none focus:border-primary placeholder:text-ink-faint"
          />
          <Button type="submit" variant="dark" size="sm">
            Buscar
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Ordenar</span>
            {SORTS.map((sort) => (
              <button
                key={sort}
                type="button"
                aria-pressed={vm.filters.sort === sort}
                onClick={() => vm.setSort(sort)}
                className={
                  vm.filters.sort === sort
                    ? 'bg-primary px-3 py-1.5 text-xs font-semibold text-white'
                    : 'border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink'
                }
              >
                {COMMUNITY_SORT_LABELS[sort]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink-soft">Período</span>
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                aria-pressed={vm.filters.period === period}
                onClick={() => vm.setPeriod(period)}
                className={
                  vm.filters.period === period
                    ? 'bg-primary px-3 py-1.5 text-xs font-semibold text-white'
                    : 'border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink'
                }
              >
                {COMMUNITY_PERIOD_LABELS[period]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-soft">Cores</span>
          {COMMUNITY_COLORS.map((color) => {
            const active = vm.filters.colors.includes(color)
            return (
              <button
                key={color}
                type="button"
                aria-pressed={active}
                onClick={() => vm.toggleColor(color)}
                className={
                  active
                    ? 'inline-flex items-center gap-1.5 border border-primary bg-primary-soft px-2.5 py-1 text-xs font-semibold text-ink'
                    : 'inline-flex items-center gap-1.5 border border-border bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-soft transition-colors hover:text-ink'
                }
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: ATTRIBUTE_COLORS[color as AttributeColor] }}
                  aria-hidden="true"
                />
                {ATTRIBUTE_LABELS[color as AttributeColor]}
              </button>
            )
          })}
        </div>
      </section>

      <p className="pb-4 pt-6 text-[13px] text-ink-faint" aria-live="polite">
        {vm.isLoading ? 'Carregando…' : `Página ${vm.page}`}
      </p>

      {vm.isLoading ? (
        <div
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Carregando decks"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex h-28 flex-col gap-3 border border-border bg-surface p-4">
              <div className="h-4 w-1/2 animate-pulse bg-surface-2" />
              <div className="h-3 w-2/3 animate-pulse bg-surface-2" />
              <div className="h-3 w-1/3 animate-pulse bg-surface-2" />
            </div>
          ))}
        </div>
      ) : vm.isError ? (
        <div className="flex flex-col items-center gap-4 border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">Não foi possível carregar a comunidade.</p>
          <Button variant="dark" size="sm" onClick={() => void vm.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : vm.decks.length === 0 ? (
        <div className="border border-border bg-surface px-6 py-12 text-center">
          <p className="text-sm text-ink-soft">
            Nenhum deck encontrado com esses filtros. Ajuste a busca ou as cores.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vm.decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={toCommunityDeckCardData(deck)}
              href={`/decks/comunidade/${deck.id}`}
              onLike={() => vm.toggleLike(deck)}
              likePending={vm.likingId === deck.id}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-8">
        <Button variant="dark" size="sm" onClick={vm.prevPage} disabled={vm.page <= 1}>
          Anterior
        </Button>
        <span className="text-sm text-ink-soft">Página {vm.page}</span>
        <Button variant="dark" size="sm" onClick={vm.nextPage} disabled={!vm.hasMore}>
          Próxima
        </Button>
      </div>
    </div>
  )
}
