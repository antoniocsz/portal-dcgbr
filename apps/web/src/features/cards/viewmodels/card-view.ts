// Path: apps/web/src/features/cards/viewmodels/card-view.ts
// Helpers de apresentação (sem hooks, sem JSX): mapeiam DTOs da API para props
// das Views do design system (CardTile) e da ficha da carta.
import type { AttributeColor, CardTileData } from '@/components'
import { ATTRIBUTE_COLORS } from '@/components'
import type { Card, CardColor, CardSummary, CardType } from '../model/types'
import { CARD_COLOR_LABELS, CARD_TYPE_LABELS } from '../model/types'

const COLOR_TO_ATTRIBUTE: Record<CardColor, AttributeColor> = {
  red: 'red',
  blue: 'blue',
  yellow: 'yellow',
  green: 'green',
  purple: 'purple',
  black: 'black',
  white: 'option'
}

export function cardTypeLabel(type: CardType): string {
  return CARD_TYPE_LABELS[type]
}

export function cardColorsLabel(colors: CardColor[]): string {
  return colors.map((color) => CARD_COLOR_LABELS[color]).join(' / ')
}

export function attributeColor(card: CardSummary): AttributeColor {
  if (card.type === 'tamer') return 'tamer'
  if (card.type === 'option') return 'option'
  const primary = card.colors[0]
  return primary ? COLOR_TO_ATTRIBUTE[primary] : 'option'
}

export function attributeHex(color: AttributeColor): string {
  return ATTRIBUTE_COLORS[color]
}

export function toCardTileData(card: CardSummary): CardTileData {
  const data: CardTileData = {
    name: card.name,
    number: card.number,
    type: cardTypeLabel(card.type),
    color: attributeColor(card)
  }
  if (card.level != null) data.level = `Lv.${card.level}`
  if (card.dp != null) data.dp = `${card.dp} DP`
  return data
}

export interface EvolutionConditionView {
  color: CardColor
  colorLabel: string
  level: number
  cost: number
}

export interface CardDetailView {
  id: string
  name: string
  number: string
  rarity: string
  typeLabel: string
  colorsLabel: string
  colorChips: { color: CardColor; label: string }[]
  level: string | null
  dp: string | null
  dpNumber: number | null
  playCost: string | null
  digiType: string | null
  attribute: string | null
  effects: string | null
  imageUrl: string | null
  setCode: string | null
  releaseLabel: string | null
  evolutionConditions: EvolutionConditionView[]
}

function formatReleaseDate(iso: string | null): string | null {
  if (!iso) return null
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(iso))
}

export function toCardDetailView(card: Card): CardDetailView {
  return {
    id: card.id,
    name: card.name,
    number: card.number,
    rarity: card.rarity,
    typeLabel: cardTypeLabel(card.type),
    colorsLabel: cardColorsLabel(card.colors),
    colorChips: card.colors.map((color) => ({
      color,
      label: CARD_COLOR_LABELS[color]
    })),
    level: card.level != null ? String(card.level) : null,
    dp: card.dp != null ? `${card.dp} DP` : null,
    dpNumber: card.dp,
    playCost: card.playCost != null ? String(card.playCost) : null,
    digiType: card.digiType,
    attribute: card.attribute,
    effects: card.effects,
    imageUrl: card.imageUrl,
    setCode: card.setCode,
    releaseLabel: formatReleaseDate(card.releaseDate),
    evolutionConditions: (card.evolutionConditions ?? []).map((condition) => ({
      color: condition.color,
      colorLabel: CARD_COLOR_LABELS[condition.color],
      level: condition.level,
      cost: condition.cost
    }))
  }
}
