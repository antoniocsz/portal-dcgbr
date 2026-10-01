// Path: apps/web/src/features/decks/viewmodels/use-deck.ts
// ViewModel: detalhe de um deck (leitura pública ou do dono).
'use client'

import { useQuery } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'
import type { Deck } from '../model/types'

export function useDeck(slug: string) {
  const query = useQuery({
    queryKey: ['decks', slug],
    queryFn: () => decksApi.getDeck(slug),
    enabled: slug.length > 0
  })

  return {
    deck: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}

export type { Deck }
