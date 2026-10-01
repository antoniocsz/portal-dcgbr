// Path: packages/modules/decks/src/use-cases/copy-deck.ts
// Copia deck de outro usuário → novo deck PRÓPRIO do copiador (rascunho).
// Só é possível copiar decks publicados E isPublic. Registra DeckCopy e
// publica deck.copied.
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import type { Actor } from '../domain/actor'
import { Deck, slugify, type DeckCardEntry } from '../domain/entities/deck'
import { DeckCopy } from '../domain/entities/deck-copy'
import { deckEvent } from '../domain/events/deck-events'
import type { DeckRepository } from '../domain/repositories/deck-repository'

export interface CopyDeckCommand {
  actor: Actor
  slug: string
}

export class CopyDeckUseCase {
  constructor(
    private readonly repo: DeckRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CopyDeckCommand): Promise<{ id: string; slug: string }> {
    const source = await this.repo.findBySlug(command.slug)
    if (!source || !source.isPublicViewable) {
      throw new NotFoundError('Deck não encontrado')
    }

    const cardList: DeckCardEntry[] = source.data.cardList.map((entry) => ({
      cardId: entry.cardId,
      quantity: entry.quantity
    }))

    const slug = await this.uniqueSlug(slugify(`${source.data.name}-copia`))
    const deck = Deck.create({
      id: randomUUID(),
      slug,
      name: `${source.data.name} (cópia)`,
      ownerId: command.actor.id,
      description: source.data.description,
      cardList,
      format: source.data.format,
      status: 'draft',
      isPublic: false
    })

    await this.repo.create(deck.data)
    await this.repo.createCopy(
      DeckCopy.create({
        id: randomUUID(),
        sourceDeckId: source.id,
        copiedById: command.actor.id
      }).data
    )
    await this.eventBus.publish(deckEvent('deck.copied', deck))

    return { id: deck.id, slug: deck.slug }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base
    let suffix = 2
    while (await this.repo.findBySlug(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    return candidate
  }
}
