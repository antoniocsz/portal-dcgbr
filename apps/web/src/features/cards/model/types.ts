// Path: apps/web/src/features/cards/model/types.ts
// Tipos da feature cards (espelho dos DTOs da API /api/cards).
// Decisão: o frontend não importa @digimon/cards no client (evita arrastar
// @digimon/database para o bundle) — tipos literais mantidos em sync com o backend.
export type CardType = 'digimon' | 'option' | 'tamer' | 'digiegg'

export type CardColor = 'red' | 'blue' | 'yellow' | 'green' | 'purple' | 'black' | 'white'

export interface EvolutionCondition {
  color: CardColor
  level: number
  cost: number
}

export interface CardSummary {
  id: string
  dcgId: string
  name: string
  number: string
  rarity: string
  type: CardType
  colors: CardColor[]
  maxCountInDeck: number
  level: number | null
  digiType: string | null
  attribute: string | null
  dp: number | null
  playCost: number | null
  effects: string | null
  imageUrl: string | null
  setCode: string | null
}

export interface Card extends CardSummary {
  evolutionConditions: EvolutionCondition[]
  releaseDate: string | null
  updatedAt: string
}

export interface CardSet {
  id: string
  code: string
  name: string
  releaseDate: string | null
}

// Payload de importação/curadoria (espelho de ImportCardsInput do módulo).
export interface CardImportInput {
  dcgId: string
  name: string
  number: string
  rarity: string
  type: CardType
  colors: CardColor[]
  maxCountInDeck?: number | null
  level?: number | null
  digiType?: string | null
  attribute?: string | null
  dp?: number | null
  playCost?: number | null
  evolutionConditions?: EvolutionCondition[] | null
  effects?: string | null
  imageUrl?: string | null
  setCode?: string | null
  releaseDate?: string | null
}

export interface CardSetImportInput {
  code: string
  name: string
  releaseDate?: string | null
}

export interface ImportCardsInput {
  cards: CardImportInput[]
  sets?: CardSetImportInput[]
}

export interface ImportCardsResult {
  imported: number
  updated: number
  sets: number
}

// Payload da importação por fonte externa (espelho de ImportCardsFromSourceInput).
export interface ImportCardsFromSourceInput {
  source?: string
  sets?: string[]
  ids?: string[]
  max?: number
}

export interface ImportCardsFromSourceResult {
  imported: number
  updated: number
  skipped: number
  sets: string[]
}

export interface AdminCardRow {
  id: string
  name: string
  number: string
  rarity: string
  type: CardType
  colors: CardColor[]
  setCode: string | null
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListCardsParams {
  search?: string
  type?: CardType
  color?: CardColor
  playCost?: number
  setCode?: string
  page?: number
  pageSize?: number
}

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  digimon: 'Digimon',
  option: 'Option',
  tamer: 'Tamer',
  digiegg: 'Digi-Egg'
}

export const CARD_COLOR_LABELS: Record<CardColor, string> = {
  red: 'Vermelho',
  blue: 'Azul',
  yellow: 'Amarelo',
  green: 'Verde',
  purple: 'Roxo',
  black: 'Preto',
  white: 'Branco'
}
