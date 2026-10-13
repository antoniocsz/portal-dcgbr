// Path: apps/web/src/features/consent/viewmodels/use-consent.ts
// ViewModel do consentimento de cookies: expõe o estado observável e os
// callbacks de decisão. A View só consome isto (MVVM estrito).
'use client'

import { useCallback, useSyncExternalStore } from 'react'
import {
  getConsent,
  recordConsentOnServer,
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
    const next = setConsent({ analytics: true, ads: true })
    void recordConsentOnServer(next)
  }, [])

  const rejectNonEssential = useCallback((): void => {
    const next = setConsent({ analytics: false, ads: false })
    void recordConsentOnServer(next)
  }, [])

  const savePreferences = useCallback((preferences: ConsentPreferences): void => {
    const next = setConsent(preferences)
    void recordConsentOnServer(next)
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
