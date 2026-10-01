// Path: packages/modules/content/src/domain/actor.ts
// Ator autenticado que executa os use cases. Papéis globais fixos (ADR-004):
// administrator | editor | member. Author não é papel — é authorId (createdBy).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface Actor {
  id: string
  role: Role
}

export const EDITORIAL_ROLES: readonly Role[] = ['administrator', 'editor'] as const

export function isEditorial(actor: Actor | null): actor is Actor {
  return actor !== null && EDITORIAL_ROLES.includes(actor.role)
}

export function requireEditorial(actor: Actor): void {
  if (!EDITORIAL_ROLES.includes(actor.role)) {
    throw new ForbiddenError('Somente administrador e editor podem executar esta ação')
  }
}
