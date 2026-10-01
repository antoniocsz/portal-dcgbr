// Path: packages/modules/tournaments/src/domain/actor.ts
// Ator autenticado que executa os use cases. Papéis globais fixos (ADR-004):
// administrator | editor | member. Author não é papel — é organizerId (criador).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface Actor {
  id: string
  role: Role
}

/** Papéis que gerenciam qualquer torneio (além do próprio criador). */
export const MANAGER_ROLES: readonly Role[] = ['administrator', 'editor'] as const

export function isManager(actor: Actor | null): boolean {
  return actor !== null && MANAGER_ROLES.includes(actor.role)
}

/** Criador do torneio OU Admin/Editor. */
export function canManage(actor: Actor, organizerId: string): boolean {
  return actor.id === organizerId || isManager(actor)
}

export function requireCanManage(actor: Actor, organizerId: string): void {
  if (!canManage(actor, organizerId)) {
    throw new ForbiddenError('Somente o criador ou Admin/Editor podem gerenciar este torneio')
  }
}
