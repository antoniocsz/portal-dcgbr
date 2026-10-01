// Path: packages/modules/decks/src/use-cases/create-deck.ts
// Member cria deck — draft ou published DIRETO (colaborativo, sem revisão).
// cardList é validado: referências às Cartas de @digimon/cards (existência).
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ConflictError, ValidationError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Deck, slugify, type DeckCardEntry, type DeckStatus } from '../domain/entities/deck'
import { deckEvent } from '../domain/events/deck-events'
import type { CardReferenceValidator } from '../domain/repositories/card-reference-validator'
import type { DeckRepository } from '../domain/repositories/deck-repository'
import { createDeckSchema, type CreateDeckInput } from './schemas'

export interface CreateDeckCommand {
  actor: Actor
  input: CreateDeckInput
}

export class CreateDeckUseCase {
  constructor(
    private readonly repo: DeckRepository,
    private readonly cards: CardReferenceValidator,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateDeckCommand): Promise<{ id: string; slug: string }> {
    const parsed = createDeckSchema.safeParse(command.input)
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos do deck', parsed.error.flatten())
    }

    const { name, format } = parsed.data
    const slug = parsed.data.slug ?? slugify(name)
    const cardList = parsed.data.cardList.map((entry): DeckCardEntry => ({
      cardId: entry.cardId,
      quantity: entry.quantity
    }))

    const status: DeckStatus = parsed.data.status ?? 'draft'
    if (status === 'published' && cardList.length === 0) {
      throw new ValidationError('Deck precisa ter ao menos uma carta para ser publicado')
    }

    await this.cards.assertCardsExist(cardList)

    const existing = await this.repo.findBySlug(slug)
    if (existing) throw new ConflictError(`Já existe um deck com o slug "${slug}"`)

    const deck = Deck.create({
      id: randomUUID(),
      slug,
      name,
      ownerId: command.actor.id,
      description: parsed.data.description ?? null,
      cardList,
      format,
      status,
      isPublic: parsed.data.isPublic ?? status === 'published'
    })

    await this.repo.create(deck.data)
    await this.eventBus.publish(deckEvent('deck.created', deck))

    return { id: deck.id, slug: deck.slug }
  }
}
