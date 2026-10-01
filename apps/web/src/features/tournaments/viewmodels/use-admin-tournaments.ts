// Path: apps/web/src/features/tournaments/viewmodels/use-admin-tournaments.ts
// ViewModel do painel admin de torneios: agenda completa (Admin/Editor filtram
// por qualquer status) com paginação + cancelamento. O backend revalida o papel.
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tournamentsApi } from '../model/tournaments-api'
import { useCancelTournament } from './use-tournament-actions'
import type { TournamentStatus, TournamentSummary } from '../model/types'

const ADMIN_PAGE_SIZE = 20

export type AdminStatusFilter = 'all' | TournamentStatus

export function useAdminTournaments() {
  const [status, setStatus] = useState<AdminStatusFilter>('all')
  const [page, setPage] = useState(1)
  const cancel = useCancelTournament()

  const query = useQuery({
    queryKey: ['admin-tournaments', status, page],
    queryFn: () =>
      tournamentsApi.listTournaments({
        ...(status === 'all' ? {} : { status }),
        page,
        pageSize: ADMIN_PAGE_SIZE
      })
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  const rows: TournamentSummary[] = query.data?.items ?? []

  const selectStatus = (next: AdminStatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return {
    rows,
    total,
    page,
    totalPages,
    status,
    selectStatus,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    },
    cancel: cancel.cancel,
    cancelAsync: cancel.cancelAsync,
    isCancelling: cancel.isPending,
    cancelError: cancel.error
  }
}
