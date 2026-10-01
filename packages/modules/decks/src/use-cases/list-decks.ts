// Path: packages/modules/decks/src/use-cases/list-decks.ts
// Listagem paginada. Público: força publicado E isPublic (nunca vaza rascunhos).
// `mine`: lista os decks do próprio ator (qualquer status) — /me/decks.
// Admin/Editor (papéis globais, ADR-004): veem TODOS os decks (rascunhos +
// published + unlisted), com filtro de status opcional — gestão admin.
import type { PaginatedResult } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import type { Role } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import type { Deck } from '../domain/entities/deck'
import type { DeckRepository, ListDecksParams } from '../domain/repositories/deck-repository'
import { listDecksSchema, type ListDecksInput } from './schemas'

export interface ListDecksCommand {
  input: ListDecksInput
  actor?: Actor | null
  mine?: boolean
}

/** Papéis com visão completa do catálogo de decks (gestão admin/editorial). */
const MANAGER_ROLES: readonly Role[] = ['administrator', 'editor']

function isManager(actor: Actor | null): boolean {
  return actor !== null && MANAGER_ROLES.includes(actor.role)
}

export class ListDecksUseCase {
  constructor(private readonly repo: DeckRepository) {}

  async execute(command: ListDecksCommand): Promise<PaginatedResult<Deck>> {
    const parsed = listDecksSchema.parse(command.input)

    const params: ListDecksParams = {
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 20
    }
    if (parsed.search) params.search = parsed.search
    if (parsed.format) params.format = parsed.format

    if (command.mine) {
      if (!command.actor) throw new UnauthorizedError('Não autenticado')
      params.ownerId = command.actor.id
      if (parsed.status) params.status = parsed.status
    } else if (isManager(command.actor ?? null)) {
      // Admin/Editor: agenda completa — qualquer status/visibilidade (filtro opcional).
      if (parsed.status) params.status = parsed.status
    } else {
      params.publicOnly = true
    }

    return this.repo.list(params)
  }
}
