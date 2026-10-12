// Path: packages/modules/ads/src/domain/actor.ts
// Ator autenticado que executa os use cases. Papéis globais fixos (ADR-004):
// administrator | editor | member. A curadoria de anúncios é exclusiva do
// administrator (aplicação comercial/patrocínio — sem delegação editorial).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface Actor {
  id: string
  role: Role
}

export const CURATION_ROLES: readonly Role[] = ['administrator'] as const

export function isCuradoria(actor: Actor | null): actor is Actor {
  return actor !== null && CURATION_ROLES.includes(actor.role)
}

export function requireCuradoria(actor: Actor): void {
  if (!CURATION_ROLES.includes(actor.role)) {
    throw new ForbiddenError('Somente o administrador pode gerenciar anúncios')
  }
}
