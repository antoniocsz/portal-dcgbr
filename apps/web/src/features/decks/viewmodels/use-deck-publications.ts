// Path: apps/web/src/features/decks/viewmodels/use-deck-publications.ts
// ViewModel das minhas publicações na comunidade: lista (com flag `outdated`),
// publica/atualiza e despublica. O slug da origem é resolvido cruzando os decks
// próprios (a rota de publicações devolve `sourceDeckId`, e a escrita usa slug).
'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'
import { communityDecksApi } from '../model/community-api'
import type { CommunityPublication } from '../model/community-types'

export interface PublicationView extends CommunityPublication {
  slug: string | null
}

const PUBLICATIONS_KEY = 'community-publications'

export function useDeckPublications() {
  const queryClient = useQueryClient()

  const publicationsQuery = useQuery({
    queryKey: [PUBLICATIONS_KEY],
    queryFn: () => communityDecksApi.listPublications()
  })

  const myDecksQuery = useQuery({
    queryKey: ['decks', { mine: true, pageSize: 100 }],
    queryFn: () => decksApi.listDecks({ mine: true, pageSize: 100 })
  })

  const publications = useMemo<PublicationView[]>(() => {
    const slugById = new Map<string, string>()
    for (const deck of myDecksQuery.data?.items ?? []) slugById.set(deck.id, deck.slug)
    return (publicationsQuery.data ?? []).map((publication) => ({
      ...publication,
      slug: slugById.get(publication.sourceDeckId) ?? null
    }))
  }, [publicationsQuery.data, myDecksQuery.data])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [PUBLICATIONS_KEY] })
    void queryClient.invalidateQueries({ queryKey: ['community-decks'] })
  }

  const publish = useMutation({
    mutationFn: (slug: string) => communityDecksApi.publish(slug),
    onSuccess: invalidate
  })

  const unpublish = useMutation({
    mutationFn: (slug: string) => communityDecksApi.unpublish(slug),
    onSuccess: invalidate
  })

  return {
    publications,
    isLoading: publicationsQuery.isLoading,
    isError: publicationsQuery.isError,
    refetch: publicationsQuery.refetch,
    publish: (slug: string) => publish.mutate(slug),
    publishing: publish.isPending,
    publishError: publish.error,
    unpublish: (slug: string) => unpublish.mutate(slug),
    unpublishing: unpublish.isPending,
    unpublishError: unpublish.error
  }
}
