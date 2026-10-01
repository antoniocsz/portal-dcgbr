// Path: apps/web/src/features/decks/viewmodels/use-deck-form.ts
// ViewModel: formulário de criação de deck (Member publica direto ou salva
// como rascunho). Orquestra validação leve (o backend revalida com Zod).
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decksApi } from '../model/decks-api'
import type { CreateDeckResult, DeckCardEntry, DeckInput, DeckStatus } from '../model/types'

export interface DeckFormValues {
  name: string
  slug: string
  description: string
  format: string
  status: DeckStatus
}

export const initialDeckFormValues: DeckFormValues = {
  name: '',
  slug: '',
  description: '',
  format: 'Standard',
  status: 'draft'
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function useDeckForm() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<DeckFormValues>(initialDeckFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cardList, setCardList] = useState<DeckCardEntry[]>([])

  const mutation = useMutation({
    mutationFn: (input: DeckInput) => decksApi.createDeck(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['decks'] })
    }
  })

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (values.name.trim().length < 3) next.name = 'Nome deve ter ao menos 3 caracteres'
    if (values.format.trim().length < 2) next.format = 'Formato é obrigatório'
    if (values.slug.trim() !== '' && !SLUG_PATTERN.test(values.slug)) {
      next.slug = 'Slug inválido (letras minúsculas, números e hífens)'
    }
    if (values.status === 'published' && cardList.length === 0) {
      next.cardList = 'Deck precisa ter ao menos uma carta para publicar'
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

  const addCard = (cardId: string, quantity = 1) => {
    setCardList((prev) => {
      const existing = prev.find((entry) => entry.cardId === cardId)
      if (existing) {
        return prev.map((entry) =>
          entry.cardId === cardId
            ? { ...entry, quantity: Math.min(50, entry.quantity + quantity) }
            : entry
        )
      }
      return [...prev, { cardId, quantity }]
    })
  }

  const removeCard = (cardId: string) => {
    setCardList((prev) => prev.filter((entry) => entry.cardId !== cardId))
  }

  const buildInput = (): DeckInput => {
    const input: DeckInput = {
      name: values.name,
      format: values.format,
      cardList,
      status: values.status
    }
    if (values.slug.trim() !== '') input.slug = values.slug
    if (values.description.trim() !== '') input.description = values.description
    return input
  }

  const handleSubmit = async (): Promise<CreateDeckResult | null> => {
    if (!validate()) return null
    try {
      return await mutation.mutateAsync(buildInput())
    } catch {
      return null
    }
  }

  return {
    values,
    errors,
    cardList,
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data as CreateDeckResult | undefined,
    handleChange,
    setStatus,
    addCard,
    removeCard,
    handleSubmit,
    reset: () => {
      setValues(initialDeckFormValues)
      setErrors({})
      setCardList([])
      mutation.reset()
    }
  }
}
