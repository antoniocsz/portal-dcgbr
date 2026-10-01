// Path: apps/web/src/features/users/viewmodel/use-profile-view-model.ts
'use client'

// ViewModel: orquestra o perfil — carrega dados e envia atualizações.
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { usersApi } from '../model/users-api'
import type { UpdateProfileForm, UserView } from '../model/types'

export interface ProfileViewModel {
  profile: UserView | null
  form: UpdateProfileForm
  isLoading: boolean
  isSaving: boolean
  error: string | null
  saved: boolean
  updateField: (field: keyof UpdateProfileForm, value: string) => void
  submit: (event: FormEvent) => Promise<void>
}

export function useProfileViewModel(): ProfileViewModel {
  const [profile, setProfile] = useState<UserView | null>(null)
  const [form, setForm] = useState<UpdateProfileForm>({ name: '', avatarUrl: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    usersApi
      .getProfile()
      .then(({ user }) => {
        setProfile(user)
        setForm({ name: user.name, avatarUrl: user.avatarUrl ?? '' })
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfil')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updateField = useCallback((field: keyof UpdateProfileForm, value: string): void => {
    setSaved(false)
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    setError(null)
    setSaved(false)
    setIsSaving(true)
    try {
      const { user } = await usersApi.updateProfile(form)
      setProfile(user)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  return { profile, form, isLoading, isSaving, error, saved, updateField, submit }
}
