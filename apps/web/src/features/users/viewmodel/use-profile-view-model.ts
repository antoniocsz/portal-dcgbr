// Path: apps/web/src/features/users/viewmodel/use-profile-view-model.ts
'use client'

// ViewModel: orquestra o perfil — carrega dados, envia atualizações e expõe os
// direitos do titular (LGPD art. 18): baixar os próprios dados e excluir a conta
// (anonimização + desativação), encerrando a sessão ao final.
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { refreshSession } from '@/lib/use-session'
import { usersApi } from '../model/users-api'
import type { UpdateProfileForm, UserView } from '../model/types'

const EXPORT_FILENAME = 'meus-dados.json'

export interface ProfileViewModel {
  profile: UserView | null
  form: UpdateProfileForm
  isLoading: boolean
  isSaving: boolean
  error: string | null
  saved: boolean
  updateField: (field: keyof UpdateProfileForm, value: string) => void
  submit: (event: FormEvent) => Promise<void>
  // Privacidade e meus dados (LGPD)
  isExportingData: boolean
  isDeletingAccount: boolean
  deleteModalOpen: boolean
  privacyError: string | null
  downloadMyData: () => Promise<void>
  openDeleteModal: () => void
  closeDeleteModal: () => void
  confirmDeleteAccount: () => Promise<void>
}

export function useProfileViewModel(): ProfileViewModel {
  const router = useRouter()
  const [profile, setProfile] = useState<UserView | null>(null)
  const [form, setForm] = useState<UpdateProfileForm>({ name: '', avatarUrl: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isExportingData, setIsExportingData] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)

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

  const downloadMyData = useCallback(async (): Promise<void> => {
    setPrivacyError(null)
    setIsExportingData(true)
    try {
      const data = await usersApi.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = EXPORT_FILENAME
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setPrivacyError(err instanceof Error ? err.message : 'Erro ao baixar seus dados')
    } finally {
      setIsExportingData(false)
    }
  }, [])

  const openDeleteModal = useCallback((): void => {
    setPrivacyError(null)
    setDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback((): void => {
    setDeleteModalOpen(false)
  }, [])

  const confirmDeleteAccount = useCallback(async (): Promise<void> => {
    setPrivacyError(null)
    setIsDeletingAccount(true)
    try {
      await usersApi.deleteAccount()
      setDeleteModalOpen(false)
      refreshSession()
      router.push('/')
      router.refresh()
    } catch (err) {
      setPrivacyError(err instanceof Error ? err.message : 'Erro ao excluir a conta')
    } finally {
      setIsDeletingAccount(false)
    }
  }, [router])

  return {
    profile,
    form,
    isLoading,
    isSaving,
    error,
    saved,
    updateField,
    submit,
    isExportingData,
    isDeletingAccount,
    deleteModalOpen,
    privacyError,
    downloadMyData,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteAccount
  }
}
