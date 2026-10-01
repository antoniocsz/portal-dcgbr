// packages/modules/comments/src/domain/actor.ts
// Ator autenticado que executa os use cases. A task 02 (auth) injetará o ator real
// vindo do JWT; enquanto ela não existe, o handler de API passa `null` (anônimo).

import type { Role } from '@digimon/contracts'

export interface CommentActor {
  userId: string
  role: Role
}

/** Papéis com poder de moderação (ocultar/exibir qualquer comentário). */
export const MODERATOR_ROLES: readonly Role[] = ['administrator', 'editor']

export function canModerate(actor: CommentActor): boolean {
  return MODERATOR_ROLES.includes(actor.role)
}
