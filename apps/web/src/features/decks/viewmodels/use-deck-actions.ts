// Path: apps/web/src/features/decks/viewmodels/use-deck-actions.ts
// ViewModel: ações de deck (publicar, excluir, copiar) — todas com
// invalidação de cache para refletir na listagem/detalhe.
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'

export function usePublishDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => decksApi.publishDeck(slug),
    onSuccess: (_result, slug) => {
      void queryClient.invalidateQueries({ queryKey: ['decks', slug] })
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })
}

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => decksApi.deleteDeck(slug),
    onSuccess: (_result, slug) => {
      void queryClient.removeQueries({ queryKey: ['decks', slug] })
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })
}

export function useCopyDeck() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => decksApi.copyDeck(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })
}
