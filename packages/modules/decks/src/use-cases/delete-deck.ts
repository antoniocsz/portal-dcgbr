// Path: packages/modules/decks/src/use-cases/delete-deck.ts
// Remove deck próprio (somente dono). Admin/Editor (papéis globais, ADR-004)
// têm override de dono: podem remover QUALQUER deck — a regra vive no DOMÍNIO
// (defense in depth: a rota admin também exige o papel, mas o use case revalida).
import { NotFoundError } from '@digimon/contracts'
import type { Role } from '@digimon/contracts'
import { requireOwner, type Actor } from '../domain/actor'
import type { DeckRepository } from '../domain/repositories/deck-repository'

export interface DeleteDeckCommand {
  actor: Actor
  slug: string
}

/** Papéis com override de dono no módulo decks (gestão admin/editorial). */
const MANAGER_ROLES: readonly Role[] = ['administrator', 'editor']

function isManager(actor: Actor): boolean {
  return MANAGER_ROLES.includes(actor.role)
}

export class DeleteDeckUseCase {
  constructor(private readonly repo: DeckRepository) {}

  async execute(command: DeleteDeckCommand): Promise<{ id: string; deleted: true }> {
    const deck = await this.repo.findBySlug(command.slug)
    if (!deck) throw new NotFoundError('Deck não encontrado')

    if (!isManager(command.actor)) {
      requireOwner(command.actor, deck.ownerId)
    }

    await this.repo.delete(deck.id)

    return { id: deck.id, deleted: true }
  }
}
