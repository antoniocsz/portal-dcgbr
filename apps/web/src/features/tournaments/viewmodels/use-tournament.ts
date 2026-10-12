// Path: apps/web/src/features/tournaments/viewmodels/use-tournament.ts
// ViewModel do detalhe de um torneio por slug: leitura pública, detecção de
// papel (organizador OU Admin/Editor) para as ações disponíveis, ações de
// cancelar/registrar resultados (reusando use-tournament-actions) e invalidação
// da query do torneio + listagem após sucesso. A View só renderiza — zero
// useQuery/useMutation nela.
'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/use-session'
import { ApiError, tournamentsApi } from '../model/tournaments-api'
import type { Tournament, TournamentResultEntry } from '../model/types'
import { useAddResults, useCancelTournament } from './use-tournament-actions'

export function useTournament(slug: string) {
  const queryClient = useQueryClient()
  const { user } = useSession()

  const query = useQuery({
    queryKey: ['tournament', slug],
    queryFn: () => tournamentsApi.getTournament(slug),
    enabled: slug.length > 0,
    retry: false
  })

  const tournament = query.data as Tournament | undefined
  const cancelAction = useCancelTournament()
  const addResultsAction = useAddResults()
  const [resultsAdded, setResultsAdded] = useState(false)

  const isManager = user?.role === 'administrator' || user?.role === 'editor'
  const isOrganizer = Boolean(tournament && user && tournament.organizerId === user.id)
  const canManage = isManager || isOrganizer

  const invalidateTournament = () => {
    void queryClient.invalidateQueries({ queryKey: ['tournament', slug] })
  }

  const cancel = () => {
    cancelAction.cancel(slug, { onSuccess: invalidateTournament })
  }

  const addResults = (results: TournamentResultEntry[]) => {
    addResultsAction.addResults(
      { slug, input: { results } },
      {
        onSuccess: () => {
          setResultsAdded(true)
          invalidateTournament()
        }
      }
    )
  }

  return {
    tournament,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound: query.error instanceof ApiError && query.error.status === 404,
    error: query.error,
    refetch: query.refetch,
    isOrganizer,
    isManager,
    canManage,
    organizerName: isOrganizer ? (user?.name ?? null) : null,
    cancel,
    isCancelling: cancelAction.isPending,
    cancelError: cancelAction.error,
    addResults,
    isAddingResults: addResultsAction.isPending,
    addResultsError: addResultsAction.error,
    resultsAdded,
    resetAddResults: () => {
      setResultsAdded(false)
      addResultsAction.reset()
    },
    resetCancel: cancelAction.reset
  }
}

export type { Tournament, TournamentResultEntry }
