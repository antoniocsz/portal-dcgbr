// Path: apps/web/src/lib/use-session.ts
// Hook de sessão do header público (ViewModel — sem JSX, sem fetch em views).
// Faz GET /auth/me na API separada (ADR-007) uma única vez por página (cache de
// módulo) e expõe { user, loading, refresh }. O cache evita fetch duplicado
// entre o menu desktop e o mobile, e `refresh` é usado após logout/login.
'use client'

import { useCallback, useEffect, useState } from 'react'
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

// Cache de módulo (persiste entre re-renders e navegações SPA)
let cachedUser: SessionUser | null | undefined
let inFlight: Promise<SessionUser | null> | null = null

async function fetchSession(): Promise<SessionUser | null> {
  try {
    const data = await apiClient.request<{ user: SessionUser | null }>('/auth/me', {
      cache: 'no-store'
    })
    return data.user
  } catch {
    return null
  }
}

function loadSession(): Promise<SessionUser | null> {
  if (cachedUser !== undefined) return Promise.resolve(cachedUser)
  if (!inFlight) {
    inFlight = fetchSession().then((user) => {
      cachedUser = user
      inFlight = null
      return user
    })
  }
  return inFlight
}

export function useSession(): SessionState {
  const [user, setUser] = useState<SessionUser | null | undefined>(cachedUser)
  const [loading, setLoading] = useState(user === undefined)

  useEffect(() => {
    let active = true
    loadSession().then((sessionUser) => {
      if (active) {
        setUser(sessionUser)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const refresh = useCallback(() => {
    cachedUser = undefined
    inFlight = null
    setUser(undefined)
    setLoading(true)
    loadSession().then((sessionUser) => {
      setUser(sessionUser)
      setLoading(false)
    })
  }, [])

  return { user: user ?? null, loading, refresh }
}
