// Path: apps/web/src/features/content/viewmodels/use-home.ts
// ViewModel da Home: destaque + últimas notícias via API pública (/api/posts).
// Torneios são conteúdo estático nesta task (módulo tournaments ainda não existe).
'use client'

import { useQuery } from '@tanstack/react-query'
import type { TournamentCardData } from '@/components'
import { contentApi } from '../model/api'
import type { PostSummary } from '../model/types'
import { toFeaturedPostView, toPostCardData, type FeaturedPostView } from './post-view'

const FEED_PAGE_SIZE = 7

const UPCOMING_TOURNAMENTS: TournamentCardData[] = [
  {
    name: 'Regional Sudeste',
    day: '28',
    month: 'NOV',
    format: 'Padrão',
    city: 'São Paulo, SP',
    status: { label: 'Inscrições abertas', tone: 'success' }
  },
  {
    name: 'Copa Nordeste',
    day: '05',
    month: 'DEZ',
    format: 'Padrão',
    city: 'Recife, PE',
    status: { label: 'Em breve', tone: 'warning' }
  },
  {
    name: 'Liga Sul',
    day: '12',
    month: 'DEZ',
    format: 'Padrão',
    city: 'Porto Alegre, RS',
    status: { label: 'Em breve', tone: 'warning' }
  }
]

export interface HomeData {
  featured: FeaturedPostView | null
  latest: ReturnType<typeof toPostCardData>[]
  tournaments: TournamentCardData[]
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
    tournaments: UPCOMING_TOURNAMENTS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    }
  }
}
