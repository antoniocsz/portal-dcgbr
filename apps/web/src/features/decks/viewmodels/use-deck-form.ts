// Path: apps/web/src/features/decks/viewmodels/use-deck-form.ts
// ViewModel do formulário de deck (criar E editar): nome/slug/formato/descrição +
// composição (main + egg) com controle de quantidade (+/−) + capa, legalidade AO
// VIVO (POST /decks/legality) e import de decklist colada.
//
// Índice de cartas: guarda os metadados das cartas adicionadas pela busca e
// resolve sob demanda (via cardsApi.getCard, em cache) os ids vindos de import —
// a View usa `resolveCard` para nomear/miniaturizar main/egg/capa.
//
// Modo edição (`mode: 'edit'`): carrega o deck (`decksApi.getDeck`), preenche o
// formulário e salva via `decksApi.updateDeck` (PATCH — sem `status`, que o
// schema stricto do backend não aceita).
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '@/features/cards/model/cards-api'
import type { CardSummary } from '@/features/cards/model/types'
import { ApiError, decksApi } from '../model/decks-api'
import { communityDecksApi } from '../model/community-api'
import { useDeckImportExport } from './use-deck-import-export'
import type { CreateDeckResult, Deck, DeckCardEntry, DeckInput, DeckStatus } from '../model/types'
import type { DeckLegalityResult, DeckListParseResult } from '../model/community-types'

export type DeckZone = 'main' | 'egg'

// Tamanhos das zonas e limite de cópias por carta (espelho de @digimon/decks —
// o client não importa o módulo p/ não arrastar o banco ao bundle).
export const MAIN_DECK_SIZE = 50
export const EGG_DECK_SIZE = 5
export const DEFAULT_MAX_COUNT_IN_DECK = 4

const ZONE_LIMITS: Record<DeckZone, number> = {
  main: MAIN_DECK_SIZE,
  egg: EGG_DECK_SIZE
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LEGALITY_DEBOUNCE_MS = 450
const CARD_STALE_TIME = 5 * 60 * 1000

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

export type DeckFormMode = 'create' | 'edit'

export interface UseDeckFormOptions {
  mode?: DeckFormMode
  slug?: string | undefined
  /** Semente opcional (evita flash) — usada como `initialData` da query. */
  initialDeck?: Deck | undefined
}

function valuesFromDeck(deck?: Deck): DeckFormValues {
  if (!deck) return initialDeckFormValues
  return {
    name: deck.name,
    slug: deck.slug,
    description: deck.description ?? '',
    format: deck.format,
    status: deck.status
  }
}

/** Deriva um slug SEO-friendly do nome (mesma regra do domínio). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sumQuantities(list: DeckCardEntry[]): number {
  return list.reduce((total, entry) => total + entry.quantity, 0)
}

export function useDeckForm(options: UseDeckFormOptions = {}) {
  const { mode = 'create', initialDeck } = options
  const isEdit = mode === 'edit'
  const editSlug = options.slug ?? initialDeck?.slug

  const queryClient = useQueryClient()
  const [values, setValues] = useState<DeckFormValues>(initialDeckFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardList, setCardList] = useState<DeckCardEntry[]>([])
  const [eggList, setEggList] = useState<DeckCardEntry[]>([])
  const [coverCardId, setCoverCardId] = useState<string | null>(null)
  const [legality, setLegality] = useState<DeckLegalityResult | null>(null)
  const [isCheckingLegality, setIsCheckingLegality] = useState(false)
  const [importSummary, setImportSummary] = useState<DeckImportSummary | null>(null)
  const [cardMeta, setCardMeta] = useState<Record<string, CardSummary>>({})
  const legalityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hydrated = useRef(false)
  const importer = useDeckImportExport()

  // Em edição, carrega o deck para preencher o formulário.
  const deckQuery = useQuery({
    queryKey: ['decks', editSlug],
    queryFn: () => decksApi.getDeck(editSlug as string),
    enabled: isEdit && Boolean(editSlug) && initialDeck === undefined,
    initialData: initialDeck,
    retry: false
  })
  const loadedDeck = deckQuery.data

  // Hidrata o formulário uma única vez com o deck carregado (preserva as edições).
  useEffect(() => {
    if (!isEdit || !loadedDeck || hydrated.current) return
    hydrated.current = true
    setValues(valuesFromDeck(loadedDeck))
    setCardList(loadedDeck.cardList)
    setEggList(loadedDeck.eggList)
    setCoverCardId(loadedDeck.coverCardId)
  }, [isEdit, loadedDeck])

  const mutation = useMutation({
    mutationFn: (input: DeckInput) =>
      isEdit ? decksApi.updateDeck(editSlug as string, input) : decksApi.createDeck(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })

  // Slug exibido no fluxo: o digitado ou o derivado do nome quando vazio.
  const effectiveSlug = values.slug.trim() !== '' ? values.slug : slugify(values.name)

  // ---- Índice de cartas ----------------------------------------------------
  const registerCard = useCallback((card: CardSummary) => {
    setCardMeta((prev) => (prev[card.id] ? prev : { ...prev, [card.id]: card }))
  }, [])

  const deckCardIds = useMemo(() => {
    const ids = new Set<string>()
    for (const entry of cardList) ids.add(entry.cardId)
    for (const entry of eggList) ids.add(entry.cardId)
    return [...ids]
  }, [cardList, eggList])

  const unresolvedIds = useMemo(
    () => deckCardIds.filter((cardId) => !cardMeta[cardId]),
    [deckCardIds, cardMeta]
  )

  const cardQueries = useQueries({
    queries: unresolvedIds.map((cardId) => ({
      queryKey: ['card', cardId],
      queryFn: () => cardsApi.getCard(cardId),
      staleTime: CARD_STALE_TIME
    }))
  })

  const cardIndex = useMemo(() => {
    const map: Record<string, CardSummary> = { ...cardMeta }
    cardQueries.forEach((result, index) => {
      const cardId = unresolvedIds[index]
      const card = result.data as CardSummary | undefined
      if (cardId && card) map[cardId] = card
    })
    return map
  }, [cardMeta, cardQueries, unresolvedIds])

  const resolveCard = useCallback(
    (cardId: string): CardSummary | undefined => cardIndex[cardId],
    [cardIndex]
  )

  const maxCountFor = useCallback(
    (cardId: string): number => {
      const max = cardIndex[cardId]?.maxCountInDeck
      return max && max > 0 ? max : DEFAULT_MAX_COUNT_IN_DECK
    },
    [cardIndex]
  )

  // ---- Composição (main/egg) ----------------------------------------------
  const setZoneList = useCallback(
    (zone: DeckZone, updater: (prev: DeckCardEntry[]) => DeckCardEntry[]) => {
      if (zone === 'egg') setEggList(updater)
      else setCardList(updater)
    },
    []
  )

  const changeQuantity = useCallback(
    (zone: DeckZone, cardId: string, delta: number) => {
      const max = maxCountFor(cardId)
      const limit = ZONE_LIMITS[zone]
      setZoneList(zone, (prev) => {
        const existing = prev.find((entry) => entry.cardId === cardId)
        const zoneTotal = sumQuantities(prev)
        if (!existing) {
          if (delta <= 0 || zoneTotal >= limit) return prev
          return [...prev, { cardId, quantity: 1 }]
        }
        const zoneRoom = Math.max(0, limit - (zoneTotal - existing.quantity))
        const upper = Math.min(max, zoneRoom)
        const nextQuantity = Math.max(0, Math.min(existing.quantity + delta, upper))
        if (nextQuantity <= 0) return prev.filter((entry) => entry.cardId !== cardId)
        if (nextQuantity === existing.quantity) return prev
        return prev.map((entry) =>
          entry.cardId === cardId ? { ...entry, quantity: nextQuantity } : entry
        )
      })
    },
    [maxCountFor, setZoneList]
  )

  const setQuantity = useCallback(
    (zone: DeckZone, cardId: string, quantity: number) => {
      const max = maxCountFor(cardId)
      const limit = ZONE_LIMITS[zone]
      const parsed = Number.isFinite(quantity) ? Math.floor(quantity) : 0
      const target = Math.max(0, Math.min(parsed, max))
      setZoneList(zone, (prev) => {
        const existing = prev.find((entry) => entry.cardId === cardId)
        const zoneTotal = sumQuantities(prev)
        if (!existing) {
          if (target <= 0 || zoneTotal >= limit) return prev
          return [...prev, { cardId, quantity: Math.min(target, limit - zoneTotal) }]
        }
        const zoneRoom = Math.max(0, limit - (zoneTotal - existing.quantity))
        const final = Math.min(target, zoneRoom, max)
        if (final <= 0) return prev.filter((entry) => entry.cardId !== cardId)
        if (final === existing.quantity) return prev
        return prev.map((entry) =>
          entry.cardId === cardId ? { ...entry, quantity: final } : entry
        )
      })
    },
    [maxCountFor, setZoneList]
  )

  const incrementCard = useCallback(
    (zone: DeckZone, cardId: string) => changeQuantity(zone, cardId, 1),
    [changeQuantity]
  )
  const decrementCard = useCallback(
    (zone: DeckZone, cardId: string) => changeQuantity(zone, cardId, -1),
    [changeQuantity]
  )

  const addCard = useCallback(
    (card: CardSummary) => {
      registerCard(card)
      changeQuantity('main', card.id, 1)
    },
    [changeQuantity, registerCard]
  )
  const addEggCard = useCallback(
    (card: CardSummary) => {
      registerCard(card)
      changeQuantity('egg', card.id, 1)
    },
    [changeQuantity, registerCard]
  )

  const removeCard = useCallback((cardId: string) => {
    setCardList((prev) => prev.filter((entry) => entry.cardId !== cardId))
  }, [])

  const removeEggCard = useCallback((cardId: string) => {
    setEggList((prev) => prev.filter((entry) => entry.cardId !== cardId))
  }, [])

  const setCoverCard = useCallback((cardId: string | null) => setCoverCardId(cardId), [])

  // A capa só pode ser uma carta do main; some se a carta sair do deck.
  useEffect(() => {
    if (coverCardId && !cardList.some((entry) => entry.cardId === coverCardId)) {
      setCoverCardId(null)
    }
  }, [coverCardId, cardList])

  // ---- Legalidade ao vivo (debounced) — só chama a API quando há cartas. ---
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

  // ---- Formulário ----------------------------------------------------------
  const validate = (status: DeckStatus): boolean => {
    const next: Record<string, string> = {}
    if (values.name.trim().length < 3) next.name = 'Nome deve ter ao menos 3 caracteres'
    if (values.format.trim().length < 2) next.format = 'Formato é obrigatório'
    if (effectiveSlug !== '' && !SLUG_PATTERN.test(effectiveSlug)) {
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

  const applyParsedList = useCallback((result: DeckListParseResult) => {
    setCardList(result.cardList)
    setEggList(result.eggList)
    setCoverCardId(null)
    setImportSummary({
      main: sumQuantities(result.cardList),
      egg: sumQuantities(result.eggList),
      skipped: result.skipped.length,
      trimmed: sumQuantities(result.trimmed)
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
      coverCardId
    }
    if (isEdit) {
      // PATCH: schema stricto do backend — não envia `status` nem `slug`.
      // Descrição vazia vira null para permitir limpar o campo.
      input.description = values.description.trim() !== '' ? values.description : null
    } else {
      input.status = status
      if (effectiveSlug !== '') input.slug = effectiveSlug
      if (values.description.trim() !== '') input.description = values.description
    }
    return input
  }

  const handleSubmit = async (status?: DeckStatus): Promise<CreateDeckResult | null> => {
    const effectiveStatus = status ?? values.status
    if (!isEdit && status) setValues((prev) => ({ ...prev, status: effectiveStatus }))
    if (!validate(effectiveStatus)) return null
    try {
      return await mutation.mutateAsync(buildInput(effectiveStatus))
    } catch {
      return null
    }
  }

  const totalMain = sumQuantities(cardList)
  const totalEgg = sumQuantities(eggList)
  const isLoading = isEdit && deckQuery.isLoading
  const loadError = isEdit ? deckQuery.error : null

  return {
    isEdit,
    isLoading,
    loadError,
    isNotFound: loadError instanceof ApiError && loadError.status === 404,
    refetchDeck: deckQuery.refetch,
    values,
    errors,
    effectiveSlug,
    cardList,
    eggList,
    coverCardId,
    totalMain,
    totalEgg,
    remainingMain: Math.max(0, MAIN_DECK_SIZE - totalMain),
    remainingEgg: Math.max(0, EGG_DECK_SIZE - totalEgg),
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
    resolveCard,
    maxCountFor,
    addCard,
    addEggCard,
    incrementCard,
    decrementCard,
    setQuantity,
    removeCard,
    removeEggCard,
    setCoverCard,
    handleSubmit,
    reset: () => {
      setValues(valuesFromDeck(loadedDeck))
      setErrors({})
      setCardList(loadedDeck?.cardList ?? [])
      setEggList(loadedDeck?.eggList ?? [])
      setCoverCardId(loadedDeck?.coverCardId ?? null)
      setLegality(null)
      setImportSummary(null)
      setCardMeta({})
      importer.resetImport()
      mutation.reset()
    }
  }
}
