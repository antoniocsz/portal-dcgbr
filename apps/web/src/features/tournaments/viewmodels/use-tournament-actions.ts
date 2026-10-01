// Path: apps/web/src/features/tournaments/viewmodels/use-tournament-actions.ts
// ViewModels de ações: cancelar torneio (DELETE) e registrar resultados (POST results).
// Ambos invalidam as listagens após sucesso.
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tournamentsApi } from '../model/tournaments-api'
import type { TournamentResultInput } from '../model/types'

export function useCancelTournament() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (slug: string) => tournamentsApi.cancelTournament(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })

  return {
    cancel: mutation.mutate,
    cancelAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset
  }
}

export function useAddResults() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ slug, input }: { slug: string; input: TournamentResultInput }) =>
      tournamentsApi.addResults(slug, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })

  return {
    addResults: mutation.mutate,
    addResultsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset
  }
}
