// Path: apps/web/src/features/consent/model/consent.ts
// Model: consentimento de cookies (LGPD). Store de módulo com persistência em
// localStorage — sem hooks e sem JSX (MVVM estrito).
//
// Gate de scripts não-essenciais:
// Scripts ESSENCIAIS (autenticação) são isentos e sempre permitidos. Qualquer
// script/SDK de terceiros (analytics, ads) DEVE ser carregado apenas com
// consentimento — use `canLoadScript('analytics' | 'ads')` ou o `hasConsent`
// do ViewModel ANTES de injetar um <script>. Hoje não há scripts de terceiros:
// este é o gancho pronto para quando existirem.

export type ConsentCategory = 'essential' | 'analytics' | 'ads'

export interface ConsentPreferences {
  analytics: boolean
  ads: boolean
}

export interface ConsentState {
  version: 1
  essential: true
  analytics: boolean
  ads: boolean
  updatedAt: string
}

const STORAGE_KEY = 'dcgb.consent.v1'
const VERSION = 1

let initialized = false
let current: ConsentState | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function parse(raw: string | null): ConsentState | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<ConsentState>
    if (value.version !== VERSION) return null
    return {
      version: VERSION,
      essential: true,
      analytics: value.analytics === true,
      ads: value.ads === true,
      updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : ''
    }
  } catch {
    return null
  }
}

function read(): ConsentState | null {
  if (!isBrowser()) return null
  try {
    return parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    // Modo privado/SSR: sem persistência.
    return null
  }
}

function ensureLoaded(): void {
  if (initialized) return
  initialized = true
  current = read()
}

/** Estado atual ou `null` enquanto o usuário ainda não decidiu. */
export function getConsent(): ConsentState | null {
  ensureLoaded()
  return current
}

/** `true` quando já houve uma decisão (aceitar todos / rejeitar / salvar). */
export function hasDecided(): boolean {
  return getConsent() !== null
}

/** Persiste a decisão (essenciais sempre permitidos) e notifica os listeners. */
export function setConsent(preferences: ConsentPreferences): ConsentState {
  const next: ConsentState = {
    version: VERSION,
    essential: true,
    analytics: preferences.analytics === true,
    ads: preferences.ads === true,
    updatedAt: new Date().toISOString()
  }
  initialized = true
  current = next
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Modo privado/SSR: mantém apenas em memória.
    }
  }
  emit()
  return next
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Gate de scripts não-essenciais. `essential` nunca passa por aqui (é isento).
 * Retorna `false` enquanto o usuário não consentir a categoria.
 */
export function canLoadScript(category: Exclude<ConsentCategory, 'essential'>): boolean {
  const consent = getConsent()
  return consent ? consent[category] === true : false
}
