// Path: apps/web/src/features/content/viewmodels/use-simulators.ts
// ViewModel da página de Simuladores (MVVM): busca os posts published da
// categoria `simulator` via useQuery. Destaque = post mais recente; o restante
// vira a grade da comunidade. Sem JSX — a View consome o estado aqui.
'use client'

import { useQuery } from '@tanstack/react-query'
import { contentApi } from '../model/api'
import type { PostSummary } from '../model/types'

export interface SimulatorsData {
  featured: PostSummary | null
  community: PostSummary[]
  total: number
  isLoading: boolean
  isError: boolean
  error: unknown
}

export function useSimulators(): SimulatorsData {
  const query = useQuery({
    queryKey: ['simulators'],
    queryFn: () => contentApi.getSimulators()
  })

  const posts = query.data?.posts ?? []
  return {
    featured: posts[0] ?? null,
    community: posts.slice(1),
    total: posts.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  }
}
