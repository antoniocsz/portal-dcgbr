// Path: apps/web/src/features/auth/viewmodel/use-login-view-model.ts
'use client'

// ViewModel: orquestra o login — estado do form, submissão e resultado.
import { useState } from 'react'
import type { FormEvent } from 'react'
import { authApi } from '../model/auth-api'
import type { AuthUser, LoginForm } from '../model/types'

export interface LoginViewModel {
  form: LoginForm
  isSubmitting: boolean
  error: string | null
  user: AuthUser | null
  updateField: (field: keyof LoginForm, value: string) => void
  submit: (event: FormEvent) => Promise<void>
}

export function useLoginViewModel(): LoginViewModel {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)

  const updateField = (field: keyof LoginForm, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const { user: logged } = await authApi.login(form)
      setUser(logged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { form, isSubmitting, error, user, updateField, submit }
}
