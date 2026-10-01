// Path: apps/web/src/features/admin/viewmodels/use-admin-decks.ts
// ViewModel do painel admin de decks: agenda completa via GET /api/admin/decks
// (rascunhos + published + unlisted) com filtro de status, busca e paginação;
// exclusão via DELETE /api/admin/decks/:slug (override de dono no backend).
// O papel atual (perfil /me) libera a exclusão apenas para administrator na UI —
// o backend revalida cada ação (defense in depth).
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/features/users/model/users-api'
import { adminDecksApi } from '../model/admin-decks-api'
import type { DeckStatus, DeckSummary } from '@/features/decks/model/types'

const ADMIN_PAGE_SIZE = 20

export type AdminStatusFilter = 'all' | DeckStatus

export function useAdminDecks() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AdminStatusFilter>('all')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['admin-decks', search, status, page],
    queryFn: () =>
      adminDecksApi.list({
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status === 'all' ? {} : { status }),
        page,
        pageSize: ADMIN_PAGE_SIZE
      })
  })

  const meQuery = useQuery({
    queryKey: ['admin-decks', 'me'],
    queryFn: () => usersApi.getProfile(),
    staleTime: 5 * 60 * 1000
  })

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => adminDecksApi.deleteDeck(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-decks'] })
    }
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  const rows: DeckSummary[] = query.data?.items ?? []

  const updateSearch = (next: string) => {
    setSearch(next)
    setPage(1)
  }

  const selectStatus = (next: AdminStatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return {
    rows,
    total,
    page,
    totalPages,
    search,
    setSearch: updateSearch,
    status,
    selectStatus,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    },
    currentRole: meQuery.data?.user.role ?? null,
    remove: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    resetDeleteError: deleteMutation.reset
  }
}
