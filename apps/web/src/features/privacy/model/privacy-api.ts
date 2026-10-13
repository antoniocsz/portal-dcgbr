// Path: apps/web/src/features/privacy/model/privacy-api.ts
// Repository público do canal de solicitações do titular (LGPD). Via
// @digimon/api-client (ADR-007). Sem hooks, sem JSX — camada Model.
import { apiClient } from '@/lib/api-base'
import type { DataRequestInput, DataRequestResult } from './types'

export { ApiError } from '@digimon/api-client'

export const privacyApi = {
  /** Abre uma solicitação do titular — `POST /privacy/requests` (público). */
  createDataRequest(input: DataRequestInput): Promise<DataRequestResult> {
    return apiClient.post('/privacy/requests', input)
  }
}
