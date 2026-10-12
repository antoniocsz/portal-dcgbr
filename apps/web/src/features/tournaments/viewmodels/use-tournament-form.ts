// Path: apps/web/src/features/tournaments/viewmodels/use-tournament-form.ts
// ViewModel do formulário de torneio (criar E editar). Em `edit` carrega o
// torneio por slug (`GET /tournaments/:slug`) e salva via
// `tournamentsApi.updateTournament` (PATCH); em `create` mantém o fluxo de
// publicação direta do Member. Orquestra validação leve (o backend revalida com
// Zod) e a mutation. A View só renderiza.
'use client'

import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, tournamentsApi } from '../model/tournaments-api'
import type { CreateTournamentResult, Tournament, TournamentInput } from '../model/types'

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

export type TournamentFormMode = 'create' | 'edit'

export interface UseTournamentFormOptions {
  mode?: TournamentFormMode
  slug?: string | undefined
  /** Semente opcional (evita flash) — usada como `initialData` da query. */
  initial?: Tournament | undefined
}

/** Converte um ISO em valor aceito por `<input type="datetime-local">`. */
function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function valuesFromTournament(tournament?: Tournament): TournamentFormValues {
  if (!tournament) return initialTournamentFormValues
  return {
    name: tournament.name,
    slug: tournament.slug,
    description: tournament.description ?? '',
    format: tournament.format,
    location: tournament.location,
    dateStart: toDateTimeLocal(tournament.dateStart),
    dateEnd: toDateTimeLocal(tournament.dateEnd)
  }
}

export function useTournamentForm(options: UseTournamentFormOptions = {}) {
  const { mode = 'create', initial } = options
  const isEdit = mode === 'edit'
  const editSlug = options.slug ?? initial?.slug

  const queryClient = useQueryClient()
  const [values, setValues] = useState<TournamentFormValues>(() =>
    initial ? valuesFromTournament(initial) : initialTournamentFormValues
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const hydrated = useRef(initial !== undefined)

  // Em edição, carrega o torneio para preencher o formulário.
  const tournamentQuery = useQuery({
    queryKey: ['tournament', editSlug],
    queryFn: () => tournamentsApi.getTournament(editSlug as string),
    enabled: isEdit && Boolean(editSlug) && initial === undefined,
    initialData: initial,
    retry: false
  })
  const loadedTournament = tournamentQuery.data

  // Hidrata o formulário uma única vez com o torneio carregado (preserva as edições).
  useEffect(() => {
    if (!isEdit || !loadedTournament || hydrated.current) return
    hydrated.current = true
    setValues(valuesFromTournament(loadedTournament))
  }, [isEdit, loadedTournament])

  const mutation = useMutation({
    mutationFn: (input: TournamentInput) =>
      isEdit
        ? tournamentsApi.updateTournament(editSlug as string, input)
        : tournamentsApi.createTournament(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      if (isEdit) void queryClient.invalidateQueries({ queryKey: ['tournament', editSlug] })
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
    if (isEdit) {
      // PATCH (schema stricto): não envia `slug` (o endereço não muda ao editar)
      // e converte campos vazios em `null` para permitir limpá-los.
      return {
        name: values.name,
        format: values.format,
        location: values.location,
        dateStart: values.dateStart,
        description: values.description.trim() !== '' ? values.description : null,
        dateEnd: values.dateEnd.trim() !== '' ? values.dateEnd : null
      }
    }
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

  const loadError = isEdit ? tournamentQuery.error : null

  return {
    isEdit,
    isLoading: isEdit && tournamentQuery.isLoading,
    loadError,
    isNotFound: loadError instanceof ApiError && loadError.status === 404,
    isCancelled: loadedTournament?.status === 'cancelled',
    refetchTournament: tournamentQuery.refetch,
    values,
    errors,
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data as CreateTournamentResult | undefined,
    handleChange,
    handleSubmit,
    reset: () => {
      setValues(isEdit ? valuesFromTournament(loadedTournament) : initialTournamentFormValues)
      setErrors({})
      mutation.reset()
    }
  }
}
