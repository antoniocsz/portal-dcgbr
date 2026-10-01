// Path: apps/web/src/features/content/viewmodels/use-post-list.ts
// ViewModel: listagem pública de posts (queryKey por filtros).
'use client'

import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { ListPostsParams, Paginated, PostSummary } from '../model/types'

export function usePostList(params: ListPostsParams = {}) {
  const query = useQuery({
    queryKey: ['posts', params],
    queryFn: () => contentApi.listPosts(params)
  })

  return {
    posts: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}

export type { Paginated, PostSummary }
