// Path: apps/web/src/features/cards/viewmodels/use-card-list.ts
// ViewModel da listagem pública de cartas: orquestra filtros + busca full-text
// + paginação. Toda mudança de filtro volta para a página 1.
'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'
import type { CardColor, CardType, ListCardsParams } from '../model/types'

export const CARD_LIST_PAGE_SIZE = 24

export interface CardFilters {
  search?: string
  type?: CardType
  color?: CardColor
  playCost?: number
  setCode?: string
}

export function useCardList(initialFilters: CardFilters = {}) {
  const [filters, setFilters] = useState<CardFilters>(initialFilters)
  const [page, setPageState] = useState(1)

  const params: ListCardsParams = { page, pageSize: CARD_LIST_PAGE_SIZE, ...filters }

  const query = useQuery({
    queryKey: ['cards', params],
    queryFn: () => cardsApi.listCards(params)
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / CARD_LIST_PAGE_SIZE))

  const updateFilters = useCallback((next: CardFilters) => {
    setFilters(next)
    setPageState(1)
  }, [])

  const setPage = useCallback(
    (next: number) => {
      setPageState((current) => {
        const clamped = Math.min(Math.max(next, 1), totalPages)
        return current === clamped ? current : clamped
      })
    },
    [totalPages]
  )

  return {
    cards: query.data?.items ?? [],
    total,
    page,
    totalPages,
    filters,
    setFilters: updateFilters,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    }
  }
}
