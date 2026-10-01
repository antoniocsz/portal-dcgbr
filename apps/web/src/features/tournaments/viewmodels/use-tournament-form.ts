// Path: apps/web/src/features/tournaments/viewmodels/use-tournament-form.ts
// ViewModel: formulário de criação de torneio (Member publica direto).
// Orquestra validação leve (o backend revalida com Zod) e a mutation create.
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tournamentsApi } from '../model/tournaments-api'
import type { CreateTournamentResult, TournamentInput } from '../model/types'

export interface TournamentFormValues {
  name: string
  slug: string
  description: string
  format: string
  location: string
  dateStart: string
  dateEnd: string
}

export const initialTournamentFormValues: TournamentFormValues = {
  name: '',
  slug: '',
  description: '',
  format: 'Standard',
  location: '',
  dateStart: '',
  dateEnd: ''
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function useTournamentForm() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<TournamentFormValues>(initialTournamentFormValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (input: TournamentInput) => tournamentsApi.createTournament(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (values.name.trim().length < 3) next.name = 'Nome deve ter ao menos 3 caracteres'
    if (values.format.trim().length < 2) next.format = 'Formato é obrigatório'
    if (values.location.trim().length < 2) next.location = 'Local é obrigatório'
    if (values.dateStart.trim() === '') next.dateStart = 'Data de início é obrigatória'
    if (values.slug.trim() !== '' && !SLUG_PATTERN.test(values.slug)) {
      next.slug = 'Slug inválido (letras minúsculas, números e hífens)'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (field: keyof TournamentFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const buildInput = (): TournamentInput => {
    const input: TournamentInput = {
      name: values.name,
      format: values.format,
      location: values.location,
      dateStart: values.dateStart
    }
    if (values.slug.trim() !== '') input.slug = values.slug
    if (values.description.trim() !== '') input.description = values.description
    if (values.dateEnd.trim() !== '') input.dateEnd = values.dateEnd
    return input
  }

  const handleSubmit = async (): Promise<CreateTournamentResult | null> => {
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
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data as CreateTournamentResult | undefined,
    handleChange,
    handleSubmit,
    reset: () => {
      setValues(initialTournamentFormValues)
      setErrors({})
      mutation.reset()
    }
  }
}
