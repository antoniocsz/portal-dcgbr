// Path: packages/modules/cards/src/domain/entities/card.ts
// Aggregate raiz do módulo cards (card database). Lógica pura, sem infraestrutura.
// Invariantes: dcgId/nome/número/raridade obrigatórios, ao menos uma cor,
// custos/níveis não negativos. A busca full-text é responsabilidade da infra.
import { ValidationError } from '@digimon/contracts'

export type CardType = 'digimon' | 'option' | 'tamer'

export type CardColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'black' | 'white'

export const CARD_TYPES: readonly CardType[] = ['digimon', 'option', 'tamer'] as const

export const CARD_COLORS: readonly CardColor[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'purple',
  'black',
  'white'
] as const

export interface EvolutionCondition {
  color: CardColor
  level: number
  cost: number
}

export interface CardData {
  id: string
  dcgId: string
  name: string
  number: string
  rarity: string
  type: CardType
  colors: CardColor[]
  level: number | null
  digiType: string | null
  attribute: string | null
  dp: number | null
  playCost: number | null
  evolutionConditions: EvolutionCondition[]
  effects: string | null
  imageUrl: string | null
  setCode: string | null
  releaseDate: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CardInputData {
  dcgId: string
  name: string
  number: string
  rarity: string
  type: CardType
  colors: CardColor[]
  level?: number | null
  digiType?: string | null
  attribute?: string | null
  dp?: number | null
  playCost?: number | null
  evolutionConditions?: EvolutionCondition[] | null
  effects?: string | null
  imageUrl?: string | null
  setCode?: string | null
  releaseDate?: Date | null
}

export interface CreateCardData extends CardInputData {
  id: string
}

function requireNonEmpty(value: string, field: string): string {
  const trimmed = value.trim()
  if (!trimmed) throw new ValidationError(`Campo "${field}" é obrigatório`)
  return trimmed
}

function requireNonNegativeInt(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(`Campo "${field}" deve ser um inteiro não negativo`)
  }
  return value
}

function validateEvolution(conditions: EvolutionCondition[]): void {
  for (const condition of conditions) {
    if (!CARD_COLORS.includes(condition.color)) {
      throw new ValidationError(`Cor de evolução inválida: ${condition.color}`)
    }
    if (!Number.isInteger(condition.level) || condition.level < 1) {
      throw new ValidationError('Nível de evolução deve ser um inteiro positivo')
    }
    if (!Number.isInteger(condition.cost) || condition.cost < 0) {
      throw new ValidationError('Custo de evolução deve ser um inteiro não negativo')
    }
  }
}

export class Card {
  private constructor(public readonly data: CardData) {}

  static create(props: CreateCardData): Card {
    const now = new Date()
    const card = Card.fromInput(props.id, props, now)
    return card
  }

  static fromData(data: CardData): Card {
    return new Card(data)
  }

  private static fromInput(id: string, props: CardInputData, now: Date): Card {
    if (!CARD_TYPES.includes(props.type)) {
      throw new ValidationError(`Tipo de carta inválido: ${props.type}`)
    }
    if (props.colors.length === 0) {
      throw new ValidationError('A carta deve ter ao menos uma cor')
    }
    for (const color of props.colors) {
      if (!CARD_COLORS.includes(color)) throw new ValidationError(`Cor inválida: ${color}`)
    }
    const evolutionConditions = props.evolutionConditions ?? []
    validateEvolution(evolutionConditions)

    return new Card({
      id,
      dcgId: requireNonEmpty(props.dcgId, 'dcgId'),
      name: requireNonEmpty(props.name, 'name'),
      number: requireNonEmpty(props.number, 'number'),
      rarity: requireNonEmpty(props.rarity, 'rarity'),
      type: props.type,
      colors: [...props.colors],
      level: props.level == null ? null : requireNonNegativeInt(props.level, 'level'),
      digiType: props.digiType ?? null,
      attribute: props.attribute ?? null,
      dp: props.dp == null ? null : requireNonNegativeInt(props.dp, 'dp'),
      playCost: props.playCost == null ? null : requireNonNegativeInt(props.playCost, 'playCost'),
      evolutionConditions: [...evolutionConditions],
      effects: props.effects ?? null,
      imageUrl: props.imageUrl ?? null,
      setCode: props.setCode ?? null,
      releaseDate: props.releaseDate ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  get id(): string {
    return this.data.id
  }

  get dcgId(): string {
    return this.data.dcgId
  }

  get name(): string {
    return this.data.name
  }

  get type(): CardType {
    return this.data.type
  }

  /** Atualiza a carta com dados de uma nova importação (curadoria). */
  update(props: CardInputData): void {
    const updated = Card.fromInput(this.data.id, props, this.data.createdAt)
    this.data.dcgId = updated.data.dcgId
    this.data.name = updated.data.name
    this.data.number = updated.data.number
    this.data.rarity = updated.data.rarity
    this.data.type = updated.data.type
    this.data.colors = updated.data.colors
    this.data.level = updated.data.level
    this.data.digiType = updated.data.digiType
    this.data.attribute = updated.data.attribute
    this.data.dp = updated.data.dp
    this.data.playCost = updated.data.playCost
    this.data.evolutionConditions = updated.data.evolutionConditions
    this.data.effects = updated.data.effects
    this.data.imageUrl = updated.data.imageUrl
    this.data.setCode = updated.data.setCode
    this.data.releaseDate = updated.data.releaseDate
    this.data.updatedAt = new Date()
  }
}

/** Normaliza o JSON de condições de evolução vindo do banco (coluna Json). */
export function parseEvolutionConditions(raw: unknown): EvolutionCondition[] {
  if (!Array.isArray(raw)) return []
  const conditions: EvolutionCondition[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { color, level, cost } = item as Record<string, unknown>
    if (typeof color !== 'string' || !CARD_COLORS.includes(color as CardColor)) continue
    if (typeof level !== 'number' || typeof cost !== 'number') continue
    conditions.push({ color: color as CardColor, level, cost })
  }
  return conditions
}
