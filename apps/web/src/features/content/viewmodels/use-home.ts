// Path: apps/web/src/features/content/viewmodels/use-home.ts
// ViewModel da Home: destaque + últimas notícias via API pública (/api/posts).
'use client'

import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { PostSummary } from '../model/types'
import { toFeaturedPostView, toPostCardData, type FeaturedPostView } from './post-view'

const FEED_PAGE_SIZE = 7

export interface HomeData {
  featured: FeaturedPostView | null
  latest: ReturnType<typeof toPostCardData>[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

export function useHome(): HomeData {
  const query = useQuery({
    queryKey: ['posts', { page: 1, pageSize: FEED_PAGE_SIZE }],
    queryFn: () => contentApi.listPosts({ page: 1, pageSize: FEED_PAGE_SIZE })
  })

  const items: PostSummary[] = query.data?.items ?? []
  const [featured, ...latest] = items

  return {
    featured: featured ? toFeaturedPostView(featured) : null,
    latest: latest.map(toPostCardData),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    }
  }
}
