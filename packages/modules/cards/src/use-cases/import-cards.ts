// Path: packages/modules/cards/src/use-cases/import-cards.ts
// Importação/curadoria do card database (somente admin). Fonte externa
// (digimoncard.dev). Cria cartas novas (card.imported) e atualiza existentes
// (card.updated). Duplicatas de dcgId dentro do mesmo lote são rejeitadas.
import { randomUUID } from 'node:crypto'
import type { EventBus } from '@digimon/contracts'
import { ValidationError } from '@digimon/contracts'
import { requireCurator, type CardActor } from '../domain/actor'
import { Card, type CardInputData } from '../domain/entities/card'
import { CardSet } from '../domain/entities/card-set'
import { cardEvent } from '../domain/events/card-events'
import type { CardRepository } from '../domain/repositories/card-repository'
import type { CardSetRepository } from '../domain/repositories/card-set-repository'
import {
  importCardsSchema,
  type CardInput,
  type CardSetInput,
  type ImportCardsInput
} from './schemas'

export interface ImportCardsCommand {
  actor: CardActor | null
  input: ImportCardsInput
}

export interface ImportCardsResult {
  imported: number
  updated: number
  sets: number
}

function toCardInput(input: CardInput): CardInputData {
  const data: CardInputData = {
    dcgId: input.dcgId,
    name: input.name,
    number: input.number,
    rarity: input.rarity,
    type: input.type,
    colors: input.colors
  }
  if (input.level !== undefined) data.level = input.level
  if (input.digiType !== undefined) data.digiType = input.digiType
  if (input.attribute !== undefined) data.attribute = input.attribute
  if (input.dp !== undefined) data.dp = input.dp
  if (input.playCost !== undefined) data.playCost = input.playCost
  if (input.evolutionConditions !== undefined) data.evolutionConditions = input.evolutionConditions
  if (input.effects !== undefined) data.effects = input.effects
  if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl
  if (input.setCode !== undefined) data.setCode = input.setCode
  if (input.releaseDate !== undefined) data.releaseDate = input.releaseDate
  return data
}

function resolveSet(existing: CardSet | null, input: CardSetInput): CardSet {
  if (existing) {
    return CardSet.fromData({
      ...existing.data,
      name: input.name,
      releaseDate: input.releaseDate ?? null,
      updatedAt: new Date()
    })
  }
  return CardSet.create({
    id: randomUUID(),
    code: input.code,
    name: input.name,
    releaseDate: input.releaseDate ?? null
  })
}

export class ImportCardsUseCase {
  constructor(
    private readonly cards: CardRepository,
    private readonly sets: CardSetRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ImportCardsCommand): Promise<ImportCardsResult> {
    requireCurator(command.actor)
    const parsed = importCardsSchema.parse(command.input)

    const seen = new Set<string>()
    for (const card of parsed.cards) {
      const key = card.dcgId.trim().toLowerCase()
      if (seen.has(key)) throw new ValidationError(`dcgId duplicado no lote de importação: ${card.dcgId}`)
      seen.add(key)
    }

    let sets = 0
    for (const input of parsed.sets ?? []) {
      const existing = await this.sets.findByCode(input.code)
      await this.sets.upsert(resolveSet(existing, input))
      sets += 1
    }

    let imported = 0
    let updated = 0
    for (const input of parsed.cards) {
      const data = toCardInput(input)
      const existing = await this.cards.findByDcgId(data.dcgId)
      if (existing) {
        existing.update(data)
        await this.cards.update(existing)
        await this.eventBus.publish(cardEvent('card.updated', existing))
        updated += 1
      } else {
        const card = Card.create({ id: randomUUID(), ...data })
        await this.cards.create(card)
        await this.eventBus.publish(cardEvent('card.imported', card))
        imported += 1
      }
    }

    return { imported, updated, sets }
  }
}
