// Path: packages/modules/privacy/src/domain/actor.ts
// Ator autenticado que executa os use cases. Papéis globais fixos (ADR-004):
// administrator | editor | member. A fila de solicitações do titular é tratada
// por administrator e editor; a auditoria de consentimento é restrita ao
// administrator (registro com dados de navegação).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface Actor {
  id: string
  role: Role
}

/** Papéis com acesso à fila de solicitações (LGPD art. 18 §3º). */
export const QUEUE_ROLES: readonly Role[] = ['administrator', 'editor'] as const

/** Papéis com acesso à auditoria de consentimento. */
export const CONSENT_AUDIT_ROLES: readonly Role[] = ['administrator'] as const

export function isQueueManager(actor: Actor | null): actor is Actor {
  return actor !== null && QUEUE_ROLES.includes(actor.role)
}

export function requireQueueManager(actor: Actor): void {
  if (!QUEUE_ROLES.includes(actor.role)) {
    throw new ForbiddenError('Somente administrator ou editor acessam a fila de solicitações')
  }
}

export function requireConsentAuditor(actor: Actor): void {
  if (!CONSENT_AUDIT_ROLES.includes(actor.role)) {
    throw new ForbiddenError('Somente o administrador acessa os registros de consentimento')
  }
}
