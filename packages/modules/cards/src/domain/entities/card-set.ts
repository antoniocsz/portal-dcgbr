// Path: packages/modules/cards/src/domain/entities/card-set.ts
// Entidade CardSet — séries/expansões do Digimon TCG (código único).
import { ValidationError } from '@digimon/contracts'

export interface CardSetData {
  id: string
  code: string
  name: string
  releaseDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateCardSetData {
  id: string
  code: string
  name: string
  releaseDate?: Date | null
}

export class CardSet {
  private constructor(public readonly data: CardSetData) {}

  static create(props: CreateCardSetData): CardSet {
    const code = props.code.trim().toUpperCase()
    const name = props.name.trim()
    if (!code) throw new ValidationError('Campo "code" é obrigatório')
    if (!name) throw new ValidationError('Campo "name" é obrigatório')
    const now = new Date()
    return new CardSet({
      id: props.id,
      code,
      name,
      releaseDate: props.releaseDate ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  static fromData(data: CardSetData): CardSet {
    return new CardSet(data)
  }

  get id(): string {
    return this.data.id
  }

  get code(): string {
    return this.data.code
  }

  get name(): string {
    return this.data.name
  }
}
