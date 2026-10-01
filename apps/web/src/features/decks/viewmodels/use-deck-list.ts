// Path: apps/web/src/features/decks/viewmodels/use-deck-list.ts
// ViewModel: listagem de decks (pública ou "meus decks" com mine).
'use client'

import { useQuery } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'
import type { DeckSummary, ListDecksParams } from '../model/types'

export function useDeckList(params: ListDecksParams = {}) {
  const query = useQuery({
    queryKey: ['decks', params],
    queryFn: () => decksApi.listDecks(params)
  })

  return {
    decks: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}

export type { DeckSummary, ListDecksParams }
