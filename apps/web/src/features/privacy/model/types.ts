// Path: apps/web/src/features/privacy/model/types.ts
// Tipos da feature privacy (espelho literal dos DTOs de @digimon/privacy).
// Decisão: o client web NÃO importa @digimon/privacy (evita arrastar o backend
// para o bundle) — os literais abaixo ficam em sync com o contrato da API.
export type DataRequestType =
  | 'access'
  | 'correction'
  | 'deletion'
  | 'portability'
  | 'consent_revocation'
  | 'other'

export type DataRequestStatus = 'open' | 'in_progress' | 'done' | 'rejected'

/** Corpo de abertura de uma solicitação do titular (art. 18 §3º). */
export interface DataRequestInput {
  type: DataRequestType
  name: string
  email: string
  message: string
}

/** Resposta de `POST /privacy/requests`. */
export interface DataRequestResult {
  id: string
}

/** DTO da fila admin (`GET /admin/privacy/requests`). */
export interface DataRequestDTO {
  id: string
  type: DataRequestType
  name: string
  email: string
  message: string
  userId: string | null
  status: DataRequestStatus
  createdAt: string
  updatedAt: string
}

/** Resultado paginado (espelho de `PaginatedResult` do @digimon/contracts). */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export const DATA_REQUEST_TYPES: DataRequestType[] = [
  'access',
  'correction',
  'deletion',
  'portability',
  'consent_revocation',
  'other'
]

export const DATA_REQUEST_TYPE_LABELS: Record<DataRequestType, string> = {
  access: 'Acesso aos dados',
  correction: 'Correção de dados',
  deletion: 'Eliminação de dados',
  portability: 'Portabilidade',
  consent_revocation: 'Revogação de consentimento',
  other: 'Outro'
}

export const DATA_REQUEST_STATUSES: DataRequestStatus[] = [
  'open',
  'in_progress',
  'done',
  'rejected'
]

export const DATA_REQUEST_STATUS_LABELS: Record<DataRequestStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em andamento',
  done: 'Concluída',
  rejected: 'Rejeitada'
}
