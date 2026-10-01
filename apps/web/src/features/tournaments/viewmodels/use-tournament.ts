// Path: apps/web/src/features/tournaments/viewmodels/use-tournament.ts
// ViewModel: leitura pública de um torneio por slug.
'use client'

import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../model/tournaments-api'
import type { Tournament } from '../model/types'

export function useTournament(slug: string) {
  const query = useQuery({
    queryKey: ['tournament', slug],
    queryFn: () => tournamentsApi.getTournament(slug),
    enabled: slug.length > 0
  })

  return {
    tournament: query.data as Tournament | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}
