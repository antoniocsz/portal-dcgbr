// Path: apps/web/src/features/admin/viewmodels/use-admin-ads.ts
// ViewModels do painel admin de anúncios (task 105):
// - useAdminAds: listagem de curadoria via GET /ads/admin (filtros placement/
//   kind/isActive + paginação), ativar/desativar (PATCH /ads/admin/:id) e
//   excluir (DELETE /ads/admin/:id), com invalidação; estado do painel do form.
// - useAdminAdForm: formulário de criação/edição com validação leve (o backend
//   revalida com Zod) e as mutations create/update.
'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AD_PLACEMENTS, adsAdminApi, type AdUpsertInput } from '../model/ads-admin-api'
import type { Ad, AdKind, AdPlacement } from '@/features/ads/model/types'

const ADMIN_PAGE_SIZE = 20

export type AdminAdsStatusFilter = 'all' | 'active' | 'inactive'

/** Converte ISO → valor de <input type="datetime-local"> (hora local). */
function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** datetime-local → ISO/UTC (null quando vazio ou inválido). */
function dateToIso(value: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

/** Texto em branco → null (o backend aceita `nullable`). */
function blankToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function useAdminAds() {
  const queryClient = useQueryClient()
  const [placement, setPlacement] = useState<AdPlacement | 'all'>('all')
  const [kind, setKind] = useState<AdKind | 'all'>('all')
  const [status, setStatus] = useState<AdminAdsStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Ad | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const query = useQuery({
    queryKey: ['admin-ads', placement, kind, status, page],
    queryFn: () =>
      adsAdminApi.list({
        ...(placement !== 'all' ? { placement } : {}),
        ...(kind !== 'all' ? { kind } : {}),
        ...(status !== 'all' ? { isActive: status === 'active' } : {}),
        page,
        pageSize: ADMIN_PAGE_SIZE
      })
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-ads'] })
  }

  const removeMutation = useMutation({
    mutationFn: (id: string) => adsAdminApi.remove(id),
    onSuccess: invalidate
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adsAdminApi.update(id, { isActive }),
    onSuccess: invalidate
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE))

  const selectPlacement = (next: AdPlacement | 'all') => {
    setPlacement(next)
    setPage(1)
  }
  const selectKind = (next: AdKind | 'all') => {
    setKind(next)
    setPage(1)
  }
  const selectStatus = (next: AdminAdsStatusFilter) => {
    setStatus(next)
    setPage(1)
  }

  return {
    rows: query.data?.items ?? [],
    total,
    page,
    totalPages,
    setPage,
    placement,
    selectPlacement,
    kind,
    selectKind,
    status,
    selectStatus,
    isLoading: query.isLoading,
    isError: query.isError,
    remove: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    removeError: removeMutation.error,
    toggleActive: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
    toggleError: toggleMutation.error,
    isFormOpen,
    editing,
    openCreate: () => {
      setEditing(null)
      setIsFormOpen(true)
    },
    openEdit: (ad: Ad) => {
      setEditing(ad)
      setIsFormOpen(true)
    },
    closeForm: () => {
      setIsFormOpen(false)
      setEditing(null)
    }
  }
}

export interface AdFormValues {
  title: string
  subtitle: string
  imageUrl: string
  targetUrl: string
  kind: AdKind
  placements: AdPlacement[]
  ctaLabel: string
  sponsorName: string
  disclosure: string
  isActive: boolean
  priority: string
  startAt: string
  endAt: string
  openInNewTab: boolean
}

export const emptyAdFormValues: AdFormValues = {
  title: '',
  subtitle: '',
  imageUrl: '',
  targetUrl: '',
  kind: 'house',
  placements: [],
  ctaLabel: '',
  sponsorName: '',
  disclosure: '',
  isActive: true,
  priority: '0',
  startAt: '',
  endAt: '',
  openInNewTab: true
}

/** Mapeia um Ad (API) para os valores do formulário de edição. */
export function toAdFormValues(ad: Ad): AdFormValues {
  return {
    title: ad.title,
    subtitle: ad.subtitle ?? '',
    imageUrl: ad.imageUrl ?? '',
    targetUrl: ad.targetUrl,
    kind: ad.kind,
    placements: ad.placements.filter((item): item is AdPlacement =>
      (AD_PLACEMENTS as readonly string[]).includes(item)
    ),
    ctaLabel: ad.ctaLabel ?? '',
    sponsorName: ad.sponsorName ?? '',
    disclosure: ad.disclosure ?? '',
    isActive: ad.isActive,
    priority: String(ad.priority),
    startAt: toDateTimeLocal(ad.startAt),
    endAt: toDateTimeLocal(ad.endAt),
    openInNewTab: ad.openInNewTab
  }
}

export function useAdminAdForm(opts: { adId?: string; initial?: AdFormValues } = {}) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<AdFormValues>({
    ...emptyAdFormValues,
    ...(opts.initial ?? {})
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-ads'] })
  }

  const create = useMutation({
    mutationFn: (input: AdUpsertInput) => adsAdminApi.create(input),
    onSuccess: invalidate
  })
  const update = useMutation({
    mutationFn: (input: AdUpsertInput) => {
      if (!opts.adId) throw new Error('adId ausente')
      return adsAdminApi.update(opts.adId, input)
    },
    onSuccess: invalidate
  })

  const isPending = create.isPending || update.isPending
  const error = create.error ?? update.error

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const setField = <K extends keyof AdFormValues>(field: K, value: AdFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    clearError(field)
  }

  const togglePlacement = (placement: AdPlacement) => {
    setValues((prev) => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter((item) => item !== placement)
        : [...prev.placements, placement]
    }))
    clearError('placements')
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (values.title.trim().length === 0) next.title = 'Título é obrigatório'
    if (!/^https?:\/\//i.test(values.targetUrl.trim())) {
      next.targetUrl = 'Informe uma URL http(s) válida'
    }
    if (values.imageUrl.trim() !== '' && !/^https?:\/\//i.test(values.imageUrl.trim())) {
      next.imageUrl = 'A imagem deve ser uma URL http(s)'
    }
    if (values.placements.length === 0) next.placements = 'Selecione ao menos um placement'
    const priority = Number.parseInt(values.priority, 10)
    if (!Number.isInteger(priority) || priority < 0) {
      next.priority = 'Prioridade deve ser um inteiro maior ou igual a 0'
    }
    if (values.startAt && values.endAt && values.startAt > values.endAt) {
      next.endAt = 'A janela final deve ser após o início'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildInput = (): AdUpsertInput => ({
    title: values.title.trim(),
    subtitle: blankToNull(values.subtitle),
    imageUrl: blankToNull(values.imageUrl),
    targetUrl: values.targetUrl.trim(),
    kind: values.kind,
    placements: values.placements,
    ctaLabel: blankToNull(values.ctaLabel),
    sponsorName: blankToNull(values.sponsorName),
    disclosure: blankToNull(values.disclosure),
    isActive: values.isActive,
    priority: Number.parseInt(values.priority, 10),
    startAt: dateToIso(values.startAt),
    endAt: dateToIso(values.endAt),
    openInNewTab: values.openInNewTab
  })

  const handleSubmit = async (): Promise<boolean> => {
    if (!validate()) return false
    if (opts.adId) {
      await update.mutateAsync(buildInput())
    } else {
      await create.mutateAsync(buildInput())
    }
    return true
  }

  return {
    values,
    errors,
    isPending,
    error,
    setField,
    togglePlacement,
    handleSubmit,
    reset: () => {
      setValues({ ...emptyAdFormValues, ...(opts.initial ?? {}) })
      setErrors({})
      create.reset()
      update.reset()
    }
  }
}
