// Path: apps/web/src/features/cards/viewmodels/use-admin-cards.ts
// ViewModel do painel admin de cartas: catálogo paginado (lê a mesma API
// pública, pageSize maior) + importação/curadoria (POST /api/cards/admin/import).
// O rascunho do JSON de importação é estado de UI do ViewModel — a View só
// renderiza.
'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../model/cards-api'
import type { AdminCardRow, CardColor, CardType, ImportCardsInput } from '../model/types'

const ADMIN_PAGE_SIZE = 20
const SOURCE_IMPORT_POLL_MS = 2000

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
  const [sourceJobId, setSourceJobId] = useState<string | null>(null)

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

  const sourceImportMutation = useMutation({
    mutationFn: () => cardsApi.startSourceImport(),
    onSuccess: (data) => setSourceJobId(data.jobId)
  })

  // Polling do job (a cada 2s) enquanto estiver rodando; para no unmount
  // (o React Query cancela o interval) e quando `done`/`error`.
  const sourceJobQuery = useQuery({
    queryKey: ['source-import-job', sourceJobId],
    enabled: sourceJobId !== null,
    queryFn: async () => {
      if (!sourceJobId) throw new Error('Job de importação sem id')
      return cardsApi.getSourceImportJob(sourceJobId)
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'running' ? SOURCE_IMPORT_POLL_MS : false
  })

  const sourceJobStatus = sourceJobQuery.data?.status

  useEffect(() => {
    if (sourceJobStatus !== 'done') return
    void queryClient.invalidateQueries({ queryKey: ['admin-cards'] })
    void queryClient.invalidateQueries({ queryKey: ['cards'] })
    void queryClient.invalidateQueries({ queryKey: ['card-sets'] })
  }, [sourceJobStatus, queryClient])

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

  const runSourceImport = () => {
    setSourceJobId(null)
    sourceImportMutation.reset()
    sourceImportMutation.mutate()
  }

  const resetSourceImport = () => {
    setSourceJobId(null)
    sourceImportMutation.reset()
  }

  const sourceImportError: Error | null = sourceImportMutation.error
    ? sourceImportMutation.error instanceof Error
      ? sourceImportMutation.error
      : new Error('Falha ao iniciar a importação externa.')
    : sourceJobStatus === 'error'
      ? new Error(sourceJobQuery.data?.error ?? 'Falha na importação externa.')
      : null

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
    resetImport: importMutation.reset,
    runSourceImport,
    isSourceImporting: sourceImportMutation.isPending || sourceJobStatus === 'running',
    sourceImportError,
    sourceImportResult: sourceJobStatus === 'done' ? sourceJobQuery.data?.result : undefined,
    resetSourceImport
  }
}
