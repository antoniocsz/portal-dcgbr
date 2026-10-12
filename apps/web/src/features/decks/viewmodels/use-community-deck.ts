// Path: apps/web/src/features/decks/viewmodels/use-community-deck.ts
// ViewModel do detalhe de um deck da comunidade: composição congelada + metadados
// das cartas (para as seções/curva), like e "copiar pra mim" (cria um rascunho
// próprio a partir do snapshot e registra a cópia). A View só renderiza.
'use client'

import { useMemo } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/features/cards/model/cards-api'
import type { CardSummary } from '@/features/cards/model/types'
import { decksApi } from '../model/decks-api'
import { communityDecksApi } from '../model/community-api'
import {
  deckCurve,
  dominantColors,
  groupDeckSections,
  type CardMetadataMap
} from './deck-sections'

const CARD_STALE_TIME = 5 * 60 * 1000

export function useCommunityDeck(id: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['community-deck', id],
    queryFn: () => communityDecksApi.get(id),
    enabled: id.length > 0
  })

  const deck = query.data

  const uniqueCardIds = useMemo(() => {
    if (!deck) return []
    const ids = new Set<string>()
    for (const entry of [...deck.cardList, ...deck.eggList]) ids.add(entry.cardId)
    return [...ids]
  }, [deck])

  const cardQueries = useQueries({
    queries: uniqueCardIds.map((cardId) => ({
      queryKey: ['card', cardId],
      queryFn: () => cardsApi.getCard(cardId),
      staleTime: CARD_STALE_TIME
    }))
  })

  const metadata = useMemo<CardMetadataMap>(() => {
    const map: CardMetadataMap = {}
    cardQueries.forEach((result, index) => {
      const cardId = uniqueCardIds[index]
      const card = result.data as CardSummary | undefined
      if (cardId && card) map[cardId] = card
    })
    return map
  }, [cardQueries, uniqueCardIds])

  const group = useMemo(
    () => (deck ? groupDeckSections(deck.cardList, deck.eggList, metadata) : null),
    [deck, metadata]
  )
  const curve = useMemo(() => (deck ? deckCurve(deck.cardList, metadata) : null), [deck, metadata])
  const colors = useMemo(() => (deck ? dominantColors(deck.colors) : []), [deck])
  const coverCard = deck?.coverCardId ? metadata[deck.coverCardId] ?? null : null

  const like = useMutation({
    mutationFn: () =>
      deck?.likedByMe ? communityDecksApi.unlike(id) : communityDecksApi.like(id),
    onSuccess: (result) => {
      queryClient.setQueryData(['community-deck', id], (current: typeof deck) =>
        current ? { ...current, likedByMe: result.liked, likeCount: result.likeCount } : current
      )
      void queryClient.invalidateQueries({ queryKey: ['community-decks'] })
    }
  })

  const copy = useMutation({
    mutationFn: async () => {
      if (!deck) return
      await decksApi.createDeck({
        name: `${deck.name} (cópia)`,
        format: 'Standard',
        cardList: deck.cardList,
        eggList: deck.eggList,
        status: 'draft'
      })
      await communityDecksApi.recordCopy(deck.id)
      return deck.id
    },
    onSuccess: () => {
      queryClient.setQueryData(['community-deck', id], (current: typeof deck) =>
        current ? { ...current, copyCount: current.copyCount + 1 } : current
      )
      void queryClient.invalidateQueries({ queryKey: ['community-decks'] })
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })

  return {
    deck,
    group,
    curve,
    colors,
    coverCard,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleLike: () => like.mutate(),
    liking: like.isPending,
    copy: () => copy.mutate(),
    copying: copy.isPending,
    copied: copy.isSuccess,
    copyError: copy.error
  }
}
