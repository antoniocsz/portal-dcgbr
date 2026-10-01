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

/** Dono do deck (única regra de gerenciamento no módulo decks). */
export function isOwner(actor: Actor, ownerId: string): boolean {
  return actor.id === ownerId
}

export function requireOwner(actor: Actor, ownerId: string): void {
  if (!isOwner(actor, ownerId)) {
    throw new ForbiddenError('Somente o dono pode gerenciar este deck')
  }
}
