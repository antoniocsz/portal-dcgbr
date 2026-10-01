// Path: apps/web/src/features/cards/viewmodels/use-card-sets.ts
// ViewModel das séries/expansões do catálogo.
'use client'

import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'

export function useCardSets() {
  const query = useQuery({
    queryKey: ['card-sets'],
    queryFn: () => cardsApi.listSets()
  })

  return {
    sets: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError
  }
}
