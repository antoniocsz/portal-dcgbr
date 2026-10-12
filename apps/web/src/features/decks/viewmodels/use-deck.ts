// Path: apps/web/src/features/decks/viewmodels/use-deck.ts
// ViewModel do detalhe de um deck (leitura pública ou do dono): carrega o deck,
// resolve os metadados das cartas (main + egg + capa) para as seções/curva,
// calcula a legalidade (POST /decks/legality) e orquestra as ações por papel
// (dono: editar/publicar/publicar na comunidade/exportar/excluir; visitante:
// copiar). A View só renderiza — zero useQuery/useMutation nela.
'use client'

import { useCallback, useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import type { CardHoverCardData, CardTileData } from '@/components'
import { attributeColor, toCardTileData } from '@/features/cards/viewmodels/card-view'
import { cardsApi } from '@/features/cards/model/cards-api'
import type { CardSummary } from '@/features/cards/model/types'
import { useSession } from '@/lib/use-session'
import { ApiError, decksApi } from '../model/decks-api'
import { communityDecksApi } from '../model/community-api'
import {
  deckCurve,
  groupDeckSections,
  type CardMetadataMap,
  type DeckCurve,
  type DeckSectionGroup
} from './deck-sections'
import { useCopyDeck, useDeleteDeck, usePublishDeck } from './use-deck-actions'
import { useDeckImportExport } from './use-deck-import-export'
import { useDeckPublications } from './use-deck-publications'
import type { Deck } from '../model/types'
import type { DeckLegalityResult } from '../model/community-types'

const CARD_STALE_TIME = 5 * 60 * 1000

export function useDeck(slug: string) {
  const { user } = useSession()

  const query = useQuery({
    queryKey: ['decks', slug],
    queryFn: () => decksApi.getDeck(slug),
    enabled: slug.length > 0,
    retry: false
  })

  const deck = query.data

  const uniqueCardIds = useMemo(() => {
    if (!deck) return []
    const ids = new Set<string>()
    for (const entry of [...deck.cardList, ...deck.eggList]) ids.add(entry.cardId)
    if (deck.coverCardId) ids.add(deck.coverCardId)
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

  const group = useMemo<DeckSectionGroup | null>(
    () => (deck ? groupDeckSections(deck.cardList, deck.eggList, metadata) : null),
    [deck, metadata]
  )

  const curve = useMemo<DeckCurve | null>(
    () => (deck ? deckCurve(deck.cardList, metadata) : null),
    [deck, metadata]
  )

  const resolveHoverCard = useCallback(
    (cardId: string): CardHoverCardData | null => {
      const card = metadata[cardId]
      if (!card) return null
      return {
        name: card.name,
        number: card.number,
        color: attributeColor(card),
        imageUrl: card.imageUrl
      }
    },
    [metadata]
  )

  const coverCard = useMemo<CardTileData | null>(() => {
    const coverId = deck?.coverCardId
    if (!coverId) return null
    const card = metadata[coverId]
    return card ? toCardTileData(card) : null
  }, [deck, metadata])

  // Legalidade da composição (reusa POST /decks/legality, como no form).
  const legalityQuery = useQuery({
    queryKey: ['deck-legality', slug, deck?.updatedAt],
    queryFn: async (): Promise<DeckLegalityResult | null> => {
      if (!deck) return null
      return communityDecksApi.checkLegality({ cardList: deck.cardList, eggList: deck.eggList })
    },
    enabled: deck !== undefined
  })

  const isOwner = Boolean(deck && user && user.id === deck.ownerId)

  const publishDeck = usePublishDeck()
  const removeDeck = useDeleteDeck()
  const copyDeck = useCopyDeck()
  const publications = useDeckPublications()
  const exporter = useDeckImportExport()

  const publicationStatus = useMemo(() => {
    if (!deck) return null
    const publication = publications.publications.find((item) => item.sourceDeckId === deck.id)
    return publication?.status ?? null
  }, [deck, publications.publications])

  const communityError =
    publications.publishError instanceof Error
      ? publications.publishError.message
      : publications.unpublishError instanceof Error
        ? publications.unpublishError.message
        : null

  return {
    deck,
    group,
    curve,
    coverCard,
    resolveHoverCard,
    legality: legalityQuery.data ?? null,
    isCheckingLegality: legalityQuery.isFetching,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotFound: query.error instanceof ApiError && query.error.status === 404,
    error: query.error,
    refetch: query.refetch,
    isOwner,
    ownerName: isOwner ? user?.name ?? null : null,
    publish: () => publishDeck.mutate(slug),
    isPublishing: publishDeck.isPending,
    publishError: publishDeck.error,
    remove: (onSuccess?: () => void) => {
      if (onSuccess) removeDeck.mutate(slug, { onSuccess })
      else removeDeck.mutate(slug)
    },
    isRemoving: removeDeck.isPending,
    removeError: removeDeck.error,
    copy: () => copyDeck.mutate(slug),
    isCopying: copyDeck.isPending,
    copyError: copyDeck.error,
    copied: copyDeck.isSuccess,
    publicationStatus,
    publishToCommunity: () => publications.publish(slug),
    isPublishingToCommunity: publications.publishing,
    unpublishFromCommunity: () => publications.unpublish(slug),
    isUnpublishingFromCommunity: publications.unpublishing,
    communityError,
    exporter
  }
}

export type { Deck }
