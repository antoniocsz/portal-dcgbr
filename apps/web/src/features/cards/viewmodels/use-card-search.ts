// Path: apps/web/src/features/cards/viewmodels/use-card-search.ts
// ViewModel de busca paginada com "Carregar mais": acumula páginas (append) em
// vez de trocar de página. Reusa o Model (`cardsApi.listCards`) e o `total` para
// saber se ainda há resultados. Toda mudança de filtro/busca reinicia a
// paginação (nova queryKey do `useInfiniteQuery`).
'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'
import type { CardColor, CardType } from '../model/types'

export const CARD_SEARCH_PAGE_SIZE = 24

export interface CardSearchFilters {
  search?: string
  type?: CardType
  color?: CardColor
  playCost?: number
  setCode?: string
}

const EMPTY_FILTERS: CardSearchFilters = {}

export function useCardSearch(initialFilters: CardSearchFilters = EMPTY_FILTERS) {
  const initialRef = useRef(initialFilters)
  const [filters, setFiltersState] = useState<CardSearchFilters>(initialRef.current)

  const query = useInfiniteQuery({
    queryKey: ['cards', 'search', filters],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      cardsApi.listCards({ page: pageParam, pageSize: CARD_SEARCH_PAGE_SIZE, ...filters }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize
      return loaded < lastPage.total ? lastPage.page + 1 : undefined
    }
  })

  const cards = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  )
  const total = query.data?.pages[0]?.total ?? 0

  const setFilters = useCallback((next: CardSearchFilters) => {
    setFiltersState(next)
  }, [])

  const reset = useCallback(() => {
    setFiltersState(initialRef.current)
  }, [])

  return {
    cards,
    total,
    search: filters.search ?? '',
    filters,
    setFilters,
    reset,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: query.hasNextPage,
    loadMore: () => {
      void query.fetchNextPage()
    },
    refetch: () => {
      void query.refetch()
    }
  }
}
