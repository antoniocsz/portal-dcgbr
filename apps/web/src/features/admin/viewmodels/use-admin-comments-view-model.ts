// Path: apps/web/src/features/admin/viewmodels/use-admin-comments-view-model.ts
// ViewModel da moderação de comentários. Consome a listagem GLOBAL real
// (GET /api/comments/admin) com filtro por status e paginação; a ação de
// moderação chama /api/comments/:id/moderate.
'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../model/admin-api'
import type { AdminCommentRow, AdminMetric } from '../model/types'

export type AdminCommentStatusFilter = 'all' | 'visible' | 'hidden' | 'deleted'

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(iso))
}

export interface AdminCommentsViewModel {
  comments: AdminCommentRow[]
  metrics: AdminMetric[]
  total: number
  page: number
  totalPages: number
  filter: AdminCommentStatusFilter
  setFilter: (filter: AdminCommentStatusFilter) => void
  setPage: (page: number) => void
  isLoading: boolean
  isError: boolean
  error: unknown
  isBusy: boolean
  moderate: (id: string, action: 'hide' | 'show') => void
}

export function useAdminCommentsViewModel(): AdminCommentsViewModel {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [filter, setFilterState] = useState<AdminCommentStatusFilter>('all')

  const query = useQuery({
    queryKey: ['admin-comments', filter, page],
    queryFn: () => {
      const params: { status?: string; page?: number; pageSize?: number } = {
        page,
        pageSize: PAGE_SIZE
      }
      if (filter !== 'all') params.status = filter
      return adminApi.listAdminComments(params)
    }
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'hide' | 'show' }) =>
      adminApi.moderateComment(id, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    }
  })

  const setFilter = useCallback((next: AdminCommentStatusFilter) => {
    setFilterState(next)
    setPage(1)
  }, [])

  const rows: AdminCommentRow[] =
    query.data?.items.map((item) => ({
      id: item.id,
      body: item.body,
      status: item.status as AdminCommentRow['status'],
      authorName: item.authorName,
      date: formatDate(item.createdAt)
    })) ?? []

  const visible = rows.filter((comment) => comment.status === 'visible').length
  const hidden = rows.filter((comment) => comment.status === 'hidden').length
  const deleted = rows.filter((comment) => comment.status === 'deleted').length

  const metrics: AdminMetric[] = [
    { label: 'Visíveis', value: String(visible), trend: 'nesta página', trendTone: 'success' },
    { label: 'Ocultos', value: String(hidden), trend: 'nesta página', trendTone: 'warning' },
    { label: 'Removidos', value: String(deleted), trend: 'nesta página', trendTone: 'neutral' },
    { label: 'Total', value: String(query.data?.total ?? 0), trend: 'no sistema', trendTone: 'neutral' }
  ]

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    comments: rows,
    metrics,
    total,
    page,
    totalPages,
    filter,
    setFilter,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isBusy: moderateMutation.isPending,
    moderate: (id, action) => moderateMutation.mutate({ id, action })
  }
}
