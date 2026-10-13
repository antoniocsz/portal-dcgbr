// Path: apps/web/src/features/content/viewmodels/use-home.ts
// ViewModel da Home: destaque + últimas notícias (API pública) + próximos torneios.
'use client'

import { useQuery } from '@tanstack/react-query'
import type { TournamentCardData } from '@/components'
import { tournamentsApi } from '@/features/tournaments/model/tournaments-api'
import { toTournamentCardData } from '@/features/tournaments/viewmodels'
import { contentApi } from '../model/api'
import type { PostSummary } from '../model/types'
import { toFeaturedPostView, toPostCardData, type FeaturedPostView } from './post-view'

const FEED_PAGE_SIZE = 7
const HOME_TOURNAMENTS = 3

export interface HomeData {
  featured: FeaturedPostView | null
  latest: ReturnType<typeof toPostCardData>[]
  tournaments: TournamentCardData[]
  isLoading: boolean
  isError: boolean
  tournamentsLoading: boolean
  tournamentsError: boolean
  refetch: () => void
}

export function useHome(): HomeData {
  const query = useQuery({
    queryKey: ['posts', { page: 1, pageSize: FEED_PAGE_SIZE }],
    queryFn: () => contentApi.listPosts({ page: 1, pageSize: FEED_PAGE_SIZE })
  })

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments', { home: true }],
    queryFn: () =>
      tournamentsApi.listTournaments({
        status: 'published',
        from: new Date().toISOString(),
        pageSize: HOME_TOURNAMENTS
      })
  })

  const items: PostSummary[] = query.data?.items ?? []
  const [featured, ...latest] = items

  return {
    featured: featured ? toFeaturedPostView(featured) : null,
    latest: latest.map(toPostCardData),
    tournaments: (tournamentsQuery.data?.items ?? []).map(toTournamentCardData),
    isLoading: query.isLoading,
    isError: query.isError,
    tournamentsLoading: tournamentsQuery.isLoading,
    tournamentsError: tournamentsQuery.isError,
    refetch: () => {
      void query.refetch()
    }
  }
}
