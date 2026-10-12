// Path: apps/web/src/features/admin/viewmodels/use-admin-deck-moderation.ts
// ViewModel da moderação de decks da comunidade: fila de reportes agrupados
// (GET /admin/decks/community/reports), reportes abertos por publicação
// (GET /admin/decks/community/:id/reports), dispensa e hide/restore. Orquestra
// dados + callbacks; a View só renderiza o que este hook devolve.
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deckModerationApi } from '../model/deck-moderation-api'
import type { CommunityModerationAction } from '../model/deck-moderation-api'

const QUEUE_KEY = 'admin-deck-moderation'

export function useAdminDeckModeration() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const queue = useQuery({
    queryKey: [QUEUE_KEY, 'reports'],
    queryFn: () => deckModerationApi.reportedDecks()
  })

  const reports = useQuery({
    queryKey: [QUEUE_KEY, 'reports', selectedId],
    queryFn: () => deckModerationApi.openReports(selectedId as string),
    enabled: Boolean(selectedId)
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] })
  }

  const dismiss = useMutation({
    mutationFn: (publicDeckId: string) => deckModerationApi.dismissReports(publicDeckId),
    onSuccess: invalidate
  })

  const moderate = useMutation({
    mutationFn: (input: { publicDeckId: string; action: CommunityModerationAction }) =>
      deckModerationApi.moderate(input.publicDeckId, input.action),
    onSuccess: invalidate
  })

  const rows = queue.data ?? []

  return {
    // fila de reportes
    rows,
    isLoading: queue.isLoading,
    isError: queue.isError,
    error: queue.error,
    refetch: () => {
      void queue.refetch()
    },

    // reportes abertos do deck selecionado
    selectedId,
    selectedDeck: rows.find((item) => item.publicDeckId === selectedId) ?? null,
    openReports: reports.data ?? [],
    isLoadingReports: reports.isLoading,
    reportsError: reports.error,
    openDeck: (publicDeckId: string) => setSelectedId(publicDeckId),
    closeDeck: () => setSelectedId(null),

    // ações
    dismiss: dismiss.mutate,
    moderate: moderate.mutate,
    busy: dismiss.isPending || moderate.isPending,
    actionError: dismiss.error ?? moderate.error
  }
}
