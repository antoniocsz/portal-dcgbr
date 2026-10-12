// Path: apps/web/src/features/decks/viewmodels/use-community-decks.ts
// ViewModel do feed da comunidade: filtros (sort/cores/busca/período) + paginação
// por página e like otimista com rollback. A View só renderiza o que este hook devolve.
'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { communityDecksApi } from '../model/community-api'
import type {
  CommunityDeckPage,
  CommunityDeckSummary,
  CommunityPeriod,
  CommunitySort
} from '../model/community-types'

export const COMMUNITY_FEED_PAGE_SIZE = 24

export interface CommunityFeedFilters {
  sort: CommunitySort
  period: CommunityPeriod
  colors: string[]
  search: string
}

export const INITIAL_COMMUNITY_FILTERS: CommunityFeedFilters = {
  sort: 'top',
  period: 'week',
  colors: [],
  search: ''
}

const FEED_KEY = 'community-decks'

function applyLikeState(
  page: CommunityDeckPage,
  deckId: string,
  likedByMe: boolean,
  likeCount: number
): CommunityDeckPage {
  return {
    ...page,
    decks: page.decks.map((item) =>
      item.id === deckId ? { ...item, likedByMe, likeCount } : item
    )
  }
}

export function useCommunityDecks() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<CommunityFeedFilters>(INITIAL_COMMUNITY_FILTERS)
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: [FEED_KEY, filters, page],
    queryFn: () => {
      const search = filters.search.trim()
      return communityDecksApi.list({
        sort: filters.sort,
        period: filters.period,
        colors: filters.colors,
        page,
        pageSize: COMMUNITY_FEED_PAGE_SIZE,
        ...(search ? { search } : {})
      })
    }
  })

  const updateFilters = useCallback((patch: Partial<CommunityFeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const toggleColor = useCallback((color: string) => {
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((value) => value !== color)
        : [...prev.colors, color]
    }))
  }, [])

  const like = useMutation({
    mutationFn: (deck: CommunityDeckSummary) =>
      deck.likedByMe ? communityDecksApi.unlike(deck.id) : communityDecksApi.like(deck.id),
    onMutate: async (deck) => {
      await queryClient.cancelQueries({ queryKey: [FEED_KEY] })
      const snapshots = queryClient.getQueriesData<CommunityDeckPage>({ queryKey: [FEED_KEY] })
      const likedByMe = !deck.likedByMe
      const likeCount = Math.max(0, deck.likeCount + (deck.likedByMe ? -1 : 1))
      for (const [key, data] of snapshots) {
        if (!data) continue
        queryClient.setQueryData<CommunityDeckPage>(
          key,
          applyLikeState(data, deck.id, likedByMe, likeCount)
        )
      }
      return { snapshots }
    },
    onError: (_error, _deck, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: (result, deck) => {
      const snapshots = queryClient.getQueriesData<CommunityDeckPage>({ queryKey: [FEED_KEY] })
      for (const [key, data] of snapshots) {
        if (!data) continue
        queryClient.setQueryData<CommunityDeckPage>(
          key,
          applyLikeState(data, deck.id, result.liked, result.likeCount)
        )
      }
    }
  })

  return {
    decks: query.data?.decks ?? [],
    hasMore: query.data?.hasMore ?? false,
    filters,
    page,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    setSort: (sort: CommunitySort) => updateFilters({ sort }),
    setPeriod: (period: CommunityPeriod) => updateFilters({ period }),
    setSearch: (search: string) => updateFilters({ search }),
    toggleColor,
    nextPage: () => setPage((value) => value + 1),
    prevPage: () => setPage((value) => Math.max(1, value - 1)),
    toggleLike: (deck: CommunityDeckSummary) => like.mutate(deck),
    likingId: like.isPending ? like.variables?.id ?? null : null
  }
}
