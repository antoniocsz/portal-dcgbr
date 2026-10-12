// Path: apps/web/src/features/cards/model/cards-api.ts
// Repository da feature: chamadas à API separada (ADR-007) via @digimon/api-client.
// Sem hooks, sem JSX — camada Model do MVVM estrito.
import { apiClient } from '@/lib/api-base'
import type {
  Card,
  CardSet,
  ImportCardsFromSourceInput,
  ImportCardsFromSourceResult,
  ImportCardsInput,
  ImportCardsResult,
  ListCardsParams,
  Paginated,
  SourceImportJob
} from './types'

export { ApiError } from '@digimon/api-client'

function buildQuery(params: ListCardsParams): string {
  const search = new URLSearchParams()
  if (params.search) search.set('search', params.search)
  if (params.type) search.set('type', params.type)
  if (params.color) search.set('color', params.color)
  if (params.playCost !== undefined) search.set('playCost', String(params.playCost))
  if (params.minPlayCost !== undefined) search.set('minPlayCost', String(params.minPlayCost))
  if (params.maxPlayCost !== undefined) search.set('maxPlayCost', String(params.maxPlayCost))
  if (params.setCode) search.set('setCode', params.setCode)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const cardsApi = {
  listCards(params: ListCardsParams = {}): Promise<Paginated<Card>> {
    return apiClient.get(`/cards${buildQuery(params)}`)
  },

  getCard(id: string): Promise<Card> {
    return apiClient.get(`/cards/${encodeURIComponent(id)}`)
  },

  listSets(): Promise<{ items: CardSet[] }> {
    return apiClient.get('/cards/sets')
  },

  importCards(input: ImportCardsInput): Promise<ImportCardsResult> {
    return apiClient.post('/cards/admin/import', input)
  },

  importCardsFromSource(
    input: ImportCardsFromSourceInput = {}
  ): Promise<ImportCardsFromSourceResult> {
    return apiClient.post('/cards/admin/import-source', input)
  },

  /** Dispara a importação externa em background → { jobId } (202 Accepted). */
  startSourceImport(input: ImportCardsFromSourceInput = {}): Promise<{ jobId: string }> {
    return apiClient.post('/cards/admin/import-source/jobs', input)
  },

  /** Progresso/resultado do job de importação externa. */
  getSourceImportJob(jobId: string): Promise<SourceImportJob> {
    return apiClient.get(`/cards/admin/import-source/jobs/${encodeURIComponent(jobId)}`)
  }
}
