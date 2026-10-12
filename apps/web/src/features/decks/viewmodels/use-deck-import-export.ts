// Path: apps/web/src/features/decks/viewmodels/use-deck-import-export.ts
// ViewModel de import/export de decklist: colar texto (parse), serializar (rota
// /decks/:slug/export) e baixar/copiar o texto. Orquestra as mutações e expõe
// estado + callbacks prontos; a View só renderiza.
'use client'

import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { communityDecksApi } from '../model/community-api'
import type { DeckListParseResult } from '../model/community-types'

export function useDeckImportExport() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const importMutation = useMutation({
    mutationFn: (value: string) => communityDecksApi.importDeckList(value)
  })

  const exportMutation = useMutation({
    mutationFn: (slug: string) => communityDecksApi.exportDeckList(slug)
  })

  const importDeckList = useCallback(
    async (value: string): Promise<DeckListParseResult | null> => {
      try {
        return await importMutation.mutateAsync(value)
      } catch {
        return null
      }
    },
    [importMutation]
  )

  const exportDeckList = useCallback(
    async (slug: string): Promise<string | null> => {
      try {
        return await exportMutation.mutateAsync(slug)
      } catch {
        return null
      }
    },
    [exportMutation]
  )

  const copyText = useCallback(async (value: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [])

  const downloadText = useCallback((value: string, filename: string): void => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }, [])

  return {
    text,
    setText,
    copied,
    importDeckList,
    importResult: importMutation.data ?? null,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    resetImport: () => {
      importMutation.reset()
      setText('')
    },
    exportDeckList,
    exportText: exportMutation.data ?? null,
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error,
    resetExport: () => {
      exportMutation.reset()
      setCopied(false)
    },
    copyText,
    downloadText
  }
}
