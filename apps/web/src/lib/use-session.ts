// Path: apps/web/src/lib/use-session.ts
// ViewModel: sessão do header público (store COMPARTILHADO).
// Diferente do cache por instância, aqui o estado vive num store de módulo com
// listeners (useSyncExternalStore), então TODOS os consumidores (UserMenu desktop
// e mobile) refletem a MESMA sessão. `refreshSession()` invalida e rebusca
// `/auth/me` na API separada (ADR-007) — usado após login/logout, sem F5.
'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { apiClient } from '@/lib/api-base'

export interface SessionUser {
  id: string
  role: 'administrator' | 'editor' | 'member'
  name: string
  email: string
}

export interface SessionState {
  user: SessionUser | null
  loading: boolean
  refresh: () => void
}

// --- store de módulo (fonte única da verdade) ---
// undefined = carregando; null = deslogado; SessionUser = logado
let current: SessionUser | null | undefined
const listeners = new Set<() => void>()
let inFlight: Promise<void> | null = null

function emit(): void {
  for (const listener of listeners) listener()
}

async function load(): Promise<void> {
  if (inFlight) return inFlight
  inFlight = (async () => {
    try {
      const data = await apiClient.request<{ user: SessionUser | null }>('/auth/me', {
        cache: 'no-store'
      })
      current = data.user
    } catch {
      current = null
    } finally {
      inFlight = null
      emit()
    }
  })()
  return inFlight
}

/** Invalida o cache e rebusca a sessão — chame após login/logout. */
export function refreshSession(): void {
  current = undefined
  emit()
  void load()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): SessionUser | null | undefined {
  return current
}

function getServerSnapshot(): SessionUser | null | undefined {
  return undefined
}

export function useSession(): SessionState {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    if (current === undefined) void load()
  }, [])

  const refresh = useCallback(() => {
    refreshSession()
  }, [])

  return { user: user ?? null, loading: user === undefined, refresh }
}
