// Path: packages/modules/decks/src/use-cases/update-deck.ts
// Edita deck. Somente o dono (Member NÃO edita decks de outros).
import type { EventBus } from '@digimon/contracts'
import { ConflictError, NotFoundError, ValidationError } from '@digimon/contracts'
import { requireOwner, type Actor } from '../domain/actor'
import type { DeckCardEntry, UpdateDeckData } from '../domain/entities/deck'
import { deckEvent } from '../domain/events/deck-events'
import type { CardReferenceValidator } from '../domain/repositories/card-reference-validator'
import type { DeckRepository } from '../domain/repositories/deck-repository'
import { updateDeckSchema, type UpdateDeckInput } from './schemas'

export interface UpdateDeckCommand {
  actor: Actor
  slug: string
  input: UpdateDeckInput
}

export class UpdateDeckUseCase {
  constructor(
    private readonly repo: DeckRepository,
    private readonly cards: CardReferenceValidator,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateDeckCommand): Promise<{ id: string; slug: string }> {
    const parsed = updateDeckSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do deck', parsed.error.flatten())
    }

    const deck = await this.repo.findBySlug(command.slug)
    if (!deck) throw new NotFoundError('Deck não encontrado')

    requireOwner(command.actor, deck.ownerId)

    if (parsed.data.slug !== undefined && parsed.data.slug !== deck.slug) {
      const clash = await this.repo.findBySlug(parsed.data.slug)
      if (clash && clash.id !== deck.id) {
        throw new ConflictError(`Já existe um deck com o slug "${parsed.data.slug}"`)
      }
    }

    if (parsed.data.cardList !== undefined) {
      const cardList: DeckCardEntry[] = parsed.data.cardList.map((entry) => ({
        cardId: entry.cardId,
        quantity: entry.quantity
      }))
      await this.cards.assertCardsExist(cardList)
    }

    const patch: UpdateDeckData = {}
    if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug
    if (parsed.data.name !== undefined) patch.name = parsed.data.name
    if (parsed.data.description !== undefined) patch.description = parsed.data.description
    if (parsed.data.cardList !== undefined) {
      patch.cardList = parsed.data.cardList.map((entry) => ({
        cardId: entry.cardId,
        quantity: entry.quantity
      }))
    }
    if (parsed.data.format !== undefined) patch.format = parsed.data.format
    if (parsed.data.isPublic !== undefined) patch.isPublic = parsed.data.isPublic

    deck.update(patch)
    await this.repo.update(deck)
    await this.eventBus.publish(deckEvent('deck.updated', deck))

    return { id: deck.id, slug: deck.slug }
  }
}
