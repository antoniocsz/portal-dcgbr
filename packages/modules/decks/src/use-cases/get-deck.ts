// Path: packages/modules/decks/src/use-cases/get-deck.ts
// Leitura por slug. Público: publicado E isPublic. Rascunhos e decks unlisted
// visíveis só ao dono (NotFound para o público — sem vazar existência).
import { NotFoundError } from '@digimon/contracts'
import { isOwner, type Actor } from '../domain/actor'
import type { Deck } from '../domain/entities/deck'
import type { DeckRepository } from '../domain/repositories/deck-repository'

export interface GetDeckCommand {
  slug: string
  actor?: Actor | null
}

export class GetDeckUseCase {
  constructor(private readonly repo: DeckRepository) {}

  async execute(command: GetDeckCommand): Promise<Deck> {
    const deck = await this.repo.findBySlug(command.slug)
    if (!deck) throw new NotFoundError('Deck não encontrado')

    const actor = command.actor ?? null
    const canSee = deck.isPublicViewable || (actor !== null && isOwner(actor, deck.ownerId))
    if (!canSee) throw new NotFoundError('Deck não encontrado')

    return deck
  }
}
