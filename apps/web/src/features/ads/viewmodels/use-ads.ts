// Path: apps/web/src/features/ads/viewmodels/use-ads.ts
// ViewModel do slot de anúncio: busca os anúncios ativos do placement (React
// Query) e resolve a rotação — 1 (por peso) para slots de item único, até N
// para in-feed. Expõe dados + callback de clique (Model); a View só renderiza.
'use client'

import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adsApi } from '../model/ads-api'
import type { Ad, AdPlacement } from '../model/types'

export interface AdSlotOptions {
  count?: number
}

export interface AdSlotData {
  ads: Ad[]
  isLoading: boolean
  /** Fire-and-forget: registra o clique sem bloquear a navegação. */
  trackClick: (id: string) => void
}

const EMPTY_ADS: Ad[] = []

/** Peso de rotação: `priority` (+1 garante elegibilidade mesmo com prioridade 0). */
function adWeight(ad: Ad): number {
  return Math.max(ad.priority, 0) + 1
}

/** Escolhe 1 candidato por peso (rotação efetiva no cliente). */
function pickWeighted(ads: Ad[]): Ad | null {
  const total = ads.reduce((sum, ad) => sum + adWeight(ad), 0)
  if (total <= 0) return null
  let threshold = Math.random() * total
  for (const ad of ads) {
    threshold -= adWeight(ad)
    if (threshold < 0) return ad
  }
  return null
}

export function useAdSlot(placement: AdPlacement, options: AdSlotOptions = {}): AdSlotData {
  const count = Math.max(1, options.count ?? 1)
  // Item único: busca um pool de candidatos (default do backend) p/ a rotação.
  const limit = count > 1 ? count : undefined

  const query = useQuery({
    queryKey: ['ads', placement, count],
    queryFn: () => adsApi.listByPlacement(placement, limit),
    staleTime: 60_000
  })

  const items = query.data?.ads ?? EMPTY_ADS

  const ads = useMemo(() => {
    if (items.length === 0) return EMPTY_ADS
    if (count > 1) return items.slice(0, count)
    const picked = pickWeighted(items)
    return picked ? [picked] : EMPTY_ADS
    // `items` é referência estável enquanto a query não refaz o fetch.
  }, [items, count])

  const trackClick = useCallback((id: string) => {
    void adsApi.trackClick(id).catch(() => {
      // Best-effort: falha de tracking não deve afetar a navegação.
    })
  }, [])

  return { ads, isLoading: query.isLoading, trackClick }
}
