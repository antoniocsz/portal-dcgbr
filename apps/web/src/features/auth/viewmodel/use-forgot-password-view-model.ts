// Path: apps/web/src/features/auth/viewmodel/use-forgot-password-view-model.ts
'use client'

// ViewModel: orquestra o pedido de recuperação de senha.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../model/auth-api'
import type { ForgotPasswordForm } from '../model/types'

export interface ForgotPasswordViewModel {
  form: ForgotPasswordForm
  isSubmitting: boolean
  error: string | null
  sent: boolean
  updateField: (value: string) => void
  submit: (event: FormEvent) => Promise<void>
}

export function useForgotPasswordViewModel(): ForgotPasswordViewModel {
  const [form, setForm] = useState<ForgotPasswordForm>({ email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const updateField = (value: string): void => {
    setForm({ email: value })
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword(form)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar recuperação')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, error, sent, updateField, submit }
}
