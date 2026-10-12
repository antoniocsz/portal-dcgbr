// Path: packages/modules/decks/src/domain/actor.ts
// Ator autenticado que executa os use cases. Papéis globais fixos (ADR-004):
// administrator | editor | member. No módulo decks o gerenciamento é do DONO
// (Member publica/edita decks próprios; NÃO edita decks de outros — pode copiar).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface Actor {
  id: string
  role: Role
}

/** Dono do deck (regra padrão de gerenciamento no módulo decks). */
export function isOwner(actor: Actor, ownerId: string): boolean {
  return actor.id === ownerId
}

export function requireOwner(actor: Actor, ownerId: string): void {
  if (!isOwner(actor, ownerId)) {
    throw new ForbiddenError('Somente o dono pode gerenciar este deck')
  }
}

/** Papéis com poderes de gestão/moderação (ADR-004 — papéis globais). */
export const MANAGER_ROLES: readonly Role[] = ['administrator', 'editor']

export function isManager(actor: Actor | null): boolean {
  return actor !== null && MANAGER_ROLES.includes(actor.role)
}

export function requireManager(actor: Actor | null): void {
  if (!isManager(actor)) {
    throw new ForbiddenError('Somente administradores e editores podem moderar publicações')
  }
}
