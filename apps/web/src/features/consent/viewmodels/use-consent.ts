// Path: apps/web/src/features/consent/viewmodels/use-consent.ts
// ViewModel do consentimento de cookies: expõe o estado observável e os
// callbacks de decisão. A View só consome isto (MVVM estrito).
'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  getConsent,
  setConsent,
  subscribe,
  type ConsentCategory,
  type ConsentPreferences,
  type ConsentState
} from '../model/consent'

export interface ConsentViewModel {
  consent: ConsentState | null
  hasDecided: boolean
  acceptAll: () => void
  rejectNonEssential: () => void
  savePreferences: (preferences: ConsentPreferences) => void
  hasConsent: (category: ConsentCategory) => boolean
}

function getServerSnapshot(): ConsentState | null {
  return null
}

export function useConsent(): ConsentViewModel {
  const consent = useSyncExternalStore(subscribe, getConsent, getServerSnapshot)

  const acceptAll = useCallback((): void => {
    setConsent({ analytics: true, ads: true })
  }, [])

  const rejectNonEssential = useCallback((): void => {
    setConsent({ analytics: false, ads: false })
  }, [])

  const savePreferences = useCallback((preferences: ConsentPreferences): void => {
    setConsent(preferences)
  }, [])

  // Essenciais (autenticação) são isentos e sempre permitidos.
  const hasConsent = useCallback((category: ConsentCategory): boolean => {
    if (category === 'essential') return true
    const state = getConsent()
    return state ? state[category] === true : false
  }, [])

  return {
    consent,
    hasDecided: consent !== null,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    hasConsent
  }
}
