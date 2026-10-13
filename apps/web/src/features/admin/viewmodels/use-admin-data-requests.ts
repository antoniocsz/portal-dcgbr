// Path: apps/web/src/features/admin/viewmodels/use-admin-data-requests.ts
// ViewModel da fila admin de solicitações do titular (LGPD): listagem via
// `GET /admin/privacy/requests` (filtro por status + paginação) e atualização de
// status via `PATCH /admin/privacy/requests/:id` com invalidação. O backend
// revalida cada ação (administrator|editor).
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { privacyAdminApi } from '../model/privacy-admin-api'
import type { DataRequestStatus } from '@/features/privacy/model/types'

const ADMIN_PAGE_SIZE = 20

export type AdminDataRequestsStatusFilter = 'all' | DataRequestStatus

export function useAdminDataRequests() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AdminDataRequestsStatusFilter>('all')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-data-requests', status, page],
    queryFn: () =>
      privacyAdminApi.listDataRequests({
        ...(status === 'all' ? {} : { status }),
        page,
        pageSize: ADMIN_PAGE_SIZE
      })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: DataRequestStatus }) =>
      privacyAdminApi.updateStatus(id, next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-data-requests'] })
    }
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  const selectStatus = (next: AdminDataRequestsStatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return {
    rows: query.data?.items ?? [],
    total,
    page,
    totalPages,
    setPage,
    status,
    selectStatus,
    isLoading: query.isLoading,
    isError: query.isError,
    updateStatus: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    resetUpdateError: updateMutation.reset
  }
}
