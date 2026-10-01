// Path: apps/web/src/features/admin/viewmodels/use-admin-dashboard-view-model.ts
// ViewModel do Painel: métricas de posts, listagem editorial e ações de
// publicação/arquivamento. A View só consome os dados e callbacks daqui.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../model/admin-api'
import type { AdminMetric, AdminPostRow } from '../model/types'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export interface AdminDashboardViewModel {
  metrics: AdminMetric[]
  posts: AdminPostRow[]
  isLoading: boolean
  error: string | null
  busyId: string | null
  reload: () => void
  publish: (id: string) => void
  archive: (id: string) => void
}

export function useAdminDashboardViewModel(): AdminDashboardViewModel {
  const [metrics, setMetrics] = useState<AdminMetric[]>([])
  const [posts, setPosts] = useState<AdminPostRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback((): void => {
    setIsLoading(true)
    setError(null)
    Promise.all([
      adminApi.countByStatus('published'),
      adminApi.countByStatus('review'),
      adminApi.countByStatus('draft'),
      adminApi.countByStatus('archived'),
      adminApi.listEditorialPosts({ pageSize: 20 })
    ])
      .then(([published, review, draft, archived, list]) => {
        setMetrics([
          { label: 'Posts publicados', value: String(published), trend: 'no ar', trendTone: 'success' },
          { label: 'Em revisão', value: String(review), trend: 'aguardando', trendTone: 'warning' },
          { label: 'Rascunhos', value: String(draft), trend: 'em edição', trendTone: 'neutral' },
          { label: 'Arquivados', value: String(archived), trend: 'histórico', trendTone: 'neutral' }
        ])
        setPosts(
          list.items.map((post) => ({
            id: post.id,
            title: post.title,
            status: post.status as AdminPostRow['status'],
            authorId: post.id.slice(0, 8),
            date: formatDate(post.publishedAt ?? post.updatedAt)
          }))
        )
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar o painel')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const runAction = useCallback(
    (id: string, action: (postId: string) => Promise<unknown>): void => {
      setBusyId(id)
      setError(null)
      action(id)
        .then(() => load())
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Erro ao executar a ação')
        })
        .finally(() => setBusyId(null))
    },
    [load]
  )

  const publish = useCallback(
    (id: string): void => runAction(id, adminApi.publishPost),
    [runAction]
  )
  const archive = useCallback(
    (id: string): void => runAction(id, adminApi.archivePost),
    [runAction]
  )

  return { metrics, posts, isLoading, error, busyId, reload: load, publish, archive }
}
