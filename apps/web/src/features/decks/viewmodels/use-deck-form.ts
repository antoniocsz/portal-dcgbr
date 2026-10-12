// Path: apps/web/src/features/decks/viewmodels/use-deck-form.ts
// ViewModel do formulário de criação de deck: nome/slug/formato/descrição +
// composição (main + egg) + capa, com validação de legalidade AO VIVO (POST
// /decks/legality) e import de decklist colada. Orquestra tudo; a View só renderiza.
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'
import { communityDecksApi } from '../model/community-api'
import { useDeckImportExport } from './use-deck-import-export'
import type { CreateDeckResult, DeckCardEntry, DeckInput, DeckStatus } from '../model/types'
import type { DeckLegalityResult, DeckListParseResult } from '../model/community-types'

export type DeckZone = 'main' | 'egg'

export interface DeckFormValues {
  name: string
  slug: string
  description: string
  format: string
  status: DeckStatus
}

export interface DeckImportSummary {
  main: number
  egg: number
  skipped: number
  trimmed: number
}

export const initialDeckFormValues: DeckFormValues = {
  name: '',
  slug: '',
  description: '',
  format: 'Standard',
  status: 'draft'
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LEGALITY_DEBOUNCE_MS = 450

export function useDeckForm() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<DeckFormValues>(initialDeckFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardList, setCardList] = useState<DeckCardEntry[]>([])
  const [eggList, setEggList] = useState<DeckCardEntry[]>([])
  const [coverCardId, setCoverCardId] = useState<string | null>(null)
  const [legality, setLegality] = useState<DeckLegalityResult | null>(null)
  const [isCheckingLegality, setIsCheckingLegality] = useState(false)
  const [importSummary, setImportSummary] = useState<DeckImportSummary | null>(null)
  const legalityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const importer = useDeckImportExport()

  const mutation = useMutation({
    mutationFn: (input: DeckInput) => decksApi.createDeck(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })

  // Legalidade ao vivo (debounced) — só chama a API quando há cartas.
  useEffect(() => {
    if (cardList.length === 0 && eggList.length === 0) {
      setLegality(null)
      setIsCheckingLegality(false)
      return
    }
    if (legalityTimer.current) clearTimeout(legalityTimer.current)
    setIsCheckingLegality(true)
    legalityTimer.current = setTimeout(() => {
      communityDecksApi
        .checkLegality({ cardList, eggList })
        .then((result) => setLegality(result))
        .catch(() => setLegality(null))
        .finally(() => setIsCheckingLegality(false))
    }, LEGALITY_DEBOUNCE_MS)
    return () => {
      if (legalityTimer.current) clearTimeout(legalityTimer.current)
    }
  }, [cardList, eggList])

  const validate = (status: DeckStatus): boolean => {
    const next: Record<string, string> = {}
    if (values.name.trim().length < 3) next.name = 'Nome deve ter ao menos 3 caracteres'
    if (values.format.trim().length < 2) next.format = 'Formato é obrigatório'
    if (values.slug.trim() !== '' && !SLUG_PATTERN.test(values.slug)) {
      next.slug = 'Slug inválido (letras minúsculas, números e hífens)'
    }
    if (status === 'published' && cardList.length === 0) {
      next.cardList = 'Deck precisa ter ao menos uma carta no main para publicar'
    }
    if (status === 'published' && legality && legality.violations.length > 0) {
      next.cardList = 'Corrija as violações de legalidade antes de publicar'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (field: keyof DeckFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const setStatus = (status: DeckStatus) => {
    setValues((prev) => ({ ...prev, status }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.cardList
      return next
    })
  }

  const addEntry = useCallback((zone: DeckZone, cardId: string, quantity = 1) => {
    const update = (prev: DeckCardEntry[]): DeckCardEntry[] => {
      const existing = prev.find((entry) => entry.cardId === cardId)
      if (existing) {
        return prev.map((entry) =>
          entry.cardId === cardId
            ? { ...entry, quantity: Math.min(50, entry.quantity + quantity) }
            : entry
        )
      }
      return [...prev, { cardId, quantity }]
    }
    if (zone === 'egg') setEggList(update)
    else setCardList(update)
  }, [])

  const addCard = useCallback((cardId: string) => addEntry('main', cardId), [addEntry])
  const addEggCard = useCallback((cardId: string) => addEntry('egg', cardId), [addEntry])

  const removeCard = (cardId: string) => {
    setCardList((prev) => prev.filter((entry) => entry.cardId !== cardId))
    setCoverCardId((prev) => (prev === cardId ? null : prev))
  }

  const removeEggCard = (cardId: string) => {
    setEggList((prev) => prev.filter((entry) => entry.cardId !== cardId))
  }

  const setCoverCard = (cardId: string | null) => setCoverCardId(cardId)

  const applyParsedList = useCallback((result: DeckListParseResult) => {
    setCardList(result.cardList)
    setEggList(result.eggList)
    setCoverCardId(null)
    setImportSummary({
      main: result.cardList.reduce((total, entry) => total + entry.quantity, 0),
      egg: result.eggList.reduce((total, entry) => total + entry.quantity, 0),
      skipped: result.skipped.length,
      trimmed: result.trimmed.reduce((total, entry) => total + entry.quantity, 0)
    })
  }, [])

  const handleImport = async (text: string): Promise<boolean> => {
    const result = await importer.importDeckList(text)
    if (!result) return false
    applyParsedList(result)
    return true
  }

  const buildInput = (status: DeckStatus): DeckInput => {
    const input: DeckInput = {
      name: values.name,
      format: values.format,
      cardList,
      eggList,
      coverCardId,
      status
    }
    if (values.slug.trim() !== '') input.slug = values.slug
    if (values.description.trim() !== '') input.description = values.description
    return input
  }

  const handleSubmit = async (status?: DeckStatus): Promise<CreateDeckResult | null> => {
    const effectiveStatus = status ?? values.status
    if (status) setValues((prev) => ({ ...prev, status: effectiveStatus }))
    if (!validate(effectiveStatus)) return null
    try {
      return await mutation.mutateAsync(buildInput(effectiveStatus))
    } catch {
      return null
    }
  }

  return {
    values,
    errors,
    cardList,
    eggList,
    coverCardId,
    totalMain: cardList.reduce((sum, entry) => sum + entry.quantity, 0),
    totalEgg: eggList.reduce((sum, entry) => sum + entry.quantity, 0),
    legality,
    isCheckingLegality,
    importSummary,
    importText: importer.text,
    setImportText: importer.setText,
    isImporting: importer.isImporting,
    importError: importer.importError,
    resetImport: () => {
      importer.resetImport()
      setImportSummary(null)
    },
    handleImport,
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data as CreateDeckResult | undefined,
    handleChange,
    setStatus,
    addCard,
    addEggCard,
    removeCard,
    removeEggCard,
    setCoverCard,
    handleSubmit,
    reset: () => {
      setValues(initialDeckFormValues)
      setErrors({})
      setCardList([])
      setEggList([])
      setCoverCardId(null)
      setLegality(null)
      setImportSummary(null)
      importer.resetImport()
      mutation.reset()
    }
  }
}
