// Path: apps/web/src/features/cards/viewmodels/use-card.ts
// ViewModel da ficha de carta (leitura pública por id/dcgId).
'use client'

import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'

export function useCard(id: string) {
  const query = useQuery({
    queryKey: ['card', id],
    queryFn: () => cardsApi.getCard(id),
    enabled: id.length > 0
  })

  return {
    card: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    }
  }
}
