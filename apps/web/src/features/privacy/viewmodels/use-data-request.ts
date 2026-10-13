// Path: apps/web/src/features/privacy/viewmodels/use-data-request.ts
// ViewModel do formulário público de solicitação do titular (LGPD art. 18 §3º).
// Orquestra estado do formulário, validação leve (o backend revalida com Zod) e
// a mutation de envio. A View só renderiza (MVVM estrito).
'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { privacyApi } from '../model/privacy-api'
import type { DataRequestInput, DataRequestResult, DataRequestType } from '../model/types'

export interface DataRequestFormValues {
  type: DataRequestType
  name: string
  email: string
  message: string
}

export const initialDataRequestValues: DataRequestFormValues = {
  type: 'access',
  name: '',
  email: '',
  message: ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useDataRequest() {
  const [values, setValues] = useState<DataRequestFormValues>(initialDataRequestValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: (input: DataRequestInput) => privacyApi.createDataRequest(input)
  })

  const setField = <K extends keyof DataRequestFormValues>(
    field: K,
    value: DataRequestFormValues[K]
  ): void => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (values.name.trim().length === 0) next.name = 'Informe o seu nome'
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Informe um e-mail válido'
    if (values.message.trim().length === 0) next.message = 'Descreva a sua solicitação'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!validate()) return false
    try {
      await mutation.mutateAsync({
        type: values.type,
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim()
      })
      return true
    } catch {
      // Erro exposto em `mutation.error` (a View exibe).
      return false
    }
  }

  return {
    values,
    errors,
    isPending: mutation.isPending,
    error: mutation.error,
    result: mutation.data as DataRequestResult | undefined,
    setField,
    handleSubmit,
    reset: () => {
      setValues(initialDataRequestValues)
      setErrors({})
      mutation.reset()
    }
  }
}
