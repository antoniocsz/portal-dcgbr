// Path: apps/web/src/lib/api-base.ts
// Resolve a base URL da API separada (ADR-007) e expõe a instância compartilhada
// do client HTTP do web. No browser fala a URL pública (NEXT_PUBLIC_API_URL);
// no SSR fala o endereço interno da rede (API_INTERNAL_URL). Sem hooks, sem JSX.
import { createApiClient } from '@digimon/api-client'

const BROWSER_FALLBACK = 'http://localhost:3001'
const SSR_FALLBACK = 'http://api:3001'

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return normalizeBaseUrl(process.env.API_INTERNAL_URL ?? SSR_FALLBACK)
  }
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? BROWSER_FALLBACK)
}

export const apiBaseUrl = resolveApiBaseUrl()

export const apiClient = createApiClient({ baseUrl: apiBaseUrl })
