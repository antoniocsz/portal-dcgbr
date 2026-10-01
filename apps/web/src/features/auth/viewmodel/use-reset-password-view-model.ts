// Path: apps/web/src/features/auth/viewmodel/use-reset-password-view-model.ts
'use client'

// ViewModel: orquestra a troca de senha com token de reset.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../model/auth-api'
import type { ResetPasswordForm } from '../model/types'

export interface ResetPasswordViewModel {
  form: ResetPasswordForm
  confirmPassword: string
  isSubmitting: boolean
  error: string | null
  done: boolean
  updateField: (field: keyof ResetPasswordForm, value: string) => void
  updateConfirmPassword: (value: string) => void
  submit: (event: FormEvent) => Promise<void>
}

export function useResetPasswordViewModel(): ResetPasswordViewModel {
  const [form, setForm] = useState<ResetPasswordForm>({ token: '', password: '' })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const updateField = (field: keyof ResetPasswordForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateConfirmPassword = (value: string): void => {
    setConfirmPassword(value)
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (form.password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.resetPassword(form)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    confirmPassword,
    isSubmitting,
    error,
    done,
    updateField,
    updateConfirmPassword,
    submit
  }
}
