// Path: packages/modules/privacy/src/domain/entities/consent-record.ts
// Aggregate de auditoria do consentimento (LGPD): registra a decisão do titular
// sobre cookies/analytics/ads. `subjectKey` é um identificador opaco (navegador
// anônimo ou id do usuário logado); `userAgent` é truncado — sem PII sensível.
import { ValidationError } from '@digimon/contracts'

/** Teto do User-Agent persistido (o header pode ser longo). */
export const MAX_USER_AGENT_LENGTH = 300

/** Versão da política vigente — bump quando o texto legal mudar. */
export const DEFAULT_POLICY_VERSION = '2026-01'

export interface ConsentRecordData {
  id: string
  subjectKey: string
  userId: string | null
  analytics: boolean
  ads: boolean
  policyVersion: string
  userAgent: string | null
  createdAt: Date
}

export interface CreateConsentRecordData {
  id: string
  subjectKey: string
  userId?: string | null
  analytics: boolean
  ads: boolean
  policyVersion?: string
  userAgent?: string | null
  createdAt?: Date
}

function truncateUserAgent(userAgent: string | null | undefined): string | null {
  if (userAgent === undefined || userAgent === null) return null
  const trimmed = userAgent.trim()
  if (trimmed.length === 0) return null
  return trimmed.length > MAX_USER_AGENT_LENGTH ? trimmed.slice(0, MAX_USER_AGENT_LENGTH) : trimmed
}

export class ConsentRecord {
  private constructor(public readonly data: ConsentRecordData) {}

  static create(props: CreateConsentRecordData): ConsentRecord {
    const subjectKey = props.subjectKey.trim()
    if (subjectKey.length === 0) {
      throw new ValidationError('subjectKey é obrigatório')
    }

    const policyVersion = (props.policyVersion ?? DEFAULT_POLICY_VERSION).trim()
    if (policyVersion.length === 0) {
      throw new ValidationError('policyVersion é obrigatório')
    }

    const data: ConsentRecordData = {
      id: props.id,
      subjectKey,
      userId: props.userId ?? null,
      analytics: props.analytics === true,
      ads: props.ads === true,
      policyVersion,
      userAgent: truncateUserAgent(props.userAgent),
      createdAt: props.createdAt ?? new Date()
    }
    return new ConsentRecord(data)
  }

  static fromData(data: ConsentRecordData): ConsentRecord {
    return new ConsentRecord(data)
  }

  get id(): string {
    return this.data.id
  }

  get subjectKey(): string {
    return this.data.subjectKey
  }
}
