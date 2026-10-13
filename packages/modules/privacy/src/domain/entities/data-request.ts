// Path: packages/modules/privacy/src/domain/entities/data-request.ts
// Aggregate de solicitações do titular (LGPD art. 18 §3º): pedidos de acesso,
// correção, eliminação, portabilidade, revogação de consentimento ou outros.
// Invariantes: nome e mensagem não vazios, e-mail em formato válido.
import { ValidationError } from '@digimon/contracts'

export type DataRequestType =
  | 'access'
  | 'correction'
  | 'deletion'
  | 'portability'
  | 'consent_revocation'
  | 'other'

export type DataRequestStatus = 'open' | 'in_progress' | 'done' | 'rejected'

export interface DataRequestData {
  id: string
  type: DataRequestType
  name: string
  email: string
  message: string
  userId: string | null
  status: DataRequestStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateDataRequestData {
  id: string
  type: DataRequestType
  name: string
  email: string
  message: string
  userId?: string | null
  createdAt?: Date
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function assertInvariants(data: Pick<DataRequestData, 'name' | 'email' | 'message'>): void {
  if (data.name.trim().length === 0) {
    throw new ValidationError('Nome é obrigatório')
  }
  if (!EMAIL_PATTERN.test(data.email.trim())) {
    throw new ValidationError('E-mail inválido')
  }
  if (data.message.trim().length === 0) {
    throw new ValidationError('Mensagem é obrigatória')
  }
}

export class DataRequest {
  private constructor(public readonly data: DataRequestData) {}

  static create(props: CreateDataRequestData): DataRequest {
    const now = props.createdAt ?? new Date()
    const data: DataRequestData = {
      id: props.id,
      type: props.type,
      name: props.name.trim(),
      email: props.email.trim(),
      message: props.message.trim(),
      userId: props.userId ?? null,
      status: 'open',
      createdAt: now,
      updatedAt: now
    }
    assertInvariants(data)
    return new DataRequest(data)
  }

  static fromData(data: DataRequestData): DataRequest {
    return new DataRequest(data)
  }

  get id(): string {
    return this.data.id
  }

  get type(): DataRequestType {
    return this.data.type
  }

  get status(): DataRequestStatus {
    return this.data.status
  }

  /** Move o status do atendimento (fila do encarregado) e atualiza updatedAt. */
  updateStatus(status: DataRequestStatus): void {
    this.data.status = status
    this.data.updatedAt = new Date()
  }
}
