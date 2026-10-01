// Path: apps/web/src/features/tournaments/viewmodels/use-tournament-list.ts
// ViewModel: listagem de torneios (agenda pública ou "meus torneios" com mine).
'use client'

import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../model/tournaments-api'
import type { ListTournamentsParams, TournamentSummary } from '../model/types'

export function useTournamentList(params: ListTournamentsParams = {}) {
  const query = useQuery({
    queryKey: ['tournaments', params],
    queryFn: () => tournamentsApi.listTournaments(params)
  })

  return {
    tournaments: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}

export type { ListTournamentsParams, TournamentSummary }
