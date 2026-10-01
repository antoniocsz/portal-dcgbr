// Path: apps/web/src/features/content/viewmodels/use-post.ts
// ViewModel: leitura pública de um post por slug.
'use client'

import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { Post } from '../model/types'

export function usePost(slug: string) {
  const query = useQuery({
    queryKey: ['post', slug],
    queryFn: () => contentApi.getPost(slug),
    enabled: slug.length > 0
  })

  return {
    post: query.data as Post | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  }
}
