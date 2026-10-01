// Path: apps/web/src/features/cards/views/cards-view.tsx
// View da listagem pública de cartas. Orquestração (filtros/query/paginação)
// fica no ViewModel; esta View só renderiza.
'use client'

import { toCardTileData } from '../viewmodels/card-view'
import { useCardList } from '../viewmodels/use-card-list'
import { CardFilters } from './card-filters'
import { CardsGrid } from './cards-grid'

export function CardsView() {
  const {
    cards,
    total,
    page,
    totalPages,
    filters,
    setFilters,
    setPage,
    isLoading,
    isError,
    refetch
  } = useCardList()

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-10 lg:px-12">
      <header className="flex flex-col gap-2.5 pb-6">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl lg:text-[40px]">
          Card Database
        </h1>
        <p className="max-w-3xl text-base leading-6 text-ink-soft">
          Busque por nome, efeito, cor ou set. Referência: digimoncard.dev.
        </p>
      </header>

      <CardFilters filters={filters} onChange={setFilters} />

      <p className="pb-4 text-[13px] text-ink-faint" aria-live="polite">
        {isLoading ? 'Carregando…' : `${total} cartas`}
      </p>

      <CardsGrid
        cards={cards.map((card) => ({ ...toCardTileData(card), id: card.id }))}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </section>
  )
}
