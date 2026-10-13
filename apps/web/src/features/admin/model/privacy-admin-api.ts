// Path: apps/web/src/features/admin/model/privacy-admin-api.ts
// Repository admin do canal de solicitações do titular (LGPD): fila
// (`GET /admin/privacy/requests` com filtro de status e paginação) e mudança de
// status (`PATCH /admin/privacy/requests/:id`). administrator|editor — o backend
// revalida. Via @digimon/api-client (ADR-007). Sem hooks, sem JSX.
import { apiClient } from '@/lib/api-base'
import type {
  DataRequestDTO,
  DataRequestStatus,
  Paginated
} from '@/features/privacy/model/types'

export { ApiError } from '@digimon/api-client'

export interface AdminDataRequestsListParams {
  status?: DataRequestStatus
  page?: number
  pageSize?: number
}

/** Resposta do PATCH de status. */
export interface UpdateDataRequestStatusResult {
  id: string
  status: DataRequestStatus
}

function buildQuery(params: AdminDataRequestsListParams): string {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.page !== undefined) search.set('page', String(params.page))
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize))
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const privacyAdminApi = {
  listDataRequests(
    params: AdminDataRequestsListParams = {}
  ): Promise<Paginated<DataRequestDTO>> {
    return apiClient.get(`/admin/privacy/requests${buildQuery(params)}`)
  },

  updateStatus(
    id: string,
    status: DataRequestStatus
  ): Promise<UpdateDataRequestStatusResult> {
    return apiClient.patch(`/admin/privacy/requests/${encodeURIComponent(id)}`, { status })
  }
}
