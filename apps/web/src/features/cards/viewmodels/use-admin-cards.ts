// Path: apps/web/src/features/cards/viewmodels/use-admin-cards.ts
// ViewModel do painel admin de cartas: catálogo paginado (lê a mesma API
// pública, pageSize maior) + importação/curadoria (POST /api/cards/admin/import).
// O rascunho do JSON de importação é estado de UI do ViewModel — a View só
// renderiza.
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'
import type { AdminCardRow, CardColor, CardType, ImportCardsInput } from '../model/types'

const ADMIN_PAGE_SIZE = 20

export interface AdminCardFilters {
  search?: string
  type?: CardType
  color?: CardColor
}

export function useAdminCards() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<AdminCardFilters>({})
  const [page, setPage] = useState(1)
  const [importJson, setImportJson] = useState('')
  const [importDraftError, setImportDraftError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const query = useQuery({
    queryKey: ['admin-cards', filters, page],
    queryFn: () =>
      cardsApi.listCards({
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.color ? { color: filters.color } : {}),
        page,
        pageSize: ADMIN_PAGE_SIZE
      })
  })

  const importMutation = useMutation({
    mutationFn: (input: ImportCardsInput) => cardsApi.importCards(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
      void queryClient.invalidateQueries({ queryKey: ['cards'] })
    }
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  const rows: AdminCardRow[] = (query.data?.items ?? []).map((card) => ({
    id: card.id,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    type: card.type,
    colors: card.colors,
    setCode: card.setCode
  }))

  const updateFilters = (next: AdminCardFilters) => {
    setFilters(next)
    setPage(1)
  }

  const toggleImport = () => {
    setImportOpen((value) => !value)
    setImportDraftError(null)
  }

  const runImport = () => {
    const trimmed = importJson.trim()
    if (!trimmed) {
      setImportDraftError('Cole o JSON de importação ({ "cards": [...] }).')
      return
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      setImportDraftError('JSON inválido — confira a sintaxe antes de importar.')
      return
    }
    importMutation.mutate(parsed as ImportCardsInput)
  }

  return {
    rows,
    total,
    page,
    totalPages,
    filters,
    setFilters: updateFilters,
    setPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch()
    },
    importOpen,
    toggleImport,
    importJson,
    setImportJson,
    importDraftError,
    runImport,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importResult: importMutation.data,
    resetImport: importMutation.reset
  }
}
