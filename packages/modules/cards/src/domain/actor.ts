// Path: packages/modules/cards/src/domain/actor.ts
// Ator autenticado que executa os use cases. Catálogo público: leitura liberada,
// escrita (importação/curadoria) somente administrator (ADR-004 — papéis globais).
import type { Role } from '@digimon/contracts'
import { ForbiddenError } from '@digimon/contracts'

export interface CardActor {
  id: string
  role: Role
}

export const CURATOR_ROLES: readonly Role[] = ['administrator'] as const

export function isCurator(actor: CardActor | null): actor is CardActor {
  return actor !== null && CURATOR_ROLES.includes(actor.role)
}

export function requireCurator(actor: CardActor | null): CardActor {
  if (!isCurator(actor)) {
    throw new ForbiddenError('Somente administrador pode importar/curar o card database')
  }
  return actor
}
