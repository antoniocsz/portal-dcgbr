// Path: apps/web/src/features/auth/viewmodel/use-register-view-model.ts
'use client'

// ViewModel: orquestra o registro — estado do form, submissão e resultado.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../model/auth-api'
import type { AuthUser, RegisterForm } from '../model/types'

export interface RegisterViewModel {
  form: RegisterForm
  isSubmitting: boolean
  error: string | null
  user: AuthUser | null
  updateField: (field: keyof RegisterForm, value: string) => void
  submit: (event: FormEvent) => Promise<void>
}

export function useRegisterViewModel(): RegisterViewModel {
  const [form, setForm] = useState<RegisterForm>({ email: '', name: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const updateField = (field: keyof RegisterForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const { user: created } = await authApi.register(form)
      setUser(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, error, user, updateField, submit }
}
