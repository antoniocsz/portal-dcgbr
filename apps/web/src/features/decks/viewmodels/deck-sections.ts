// Path: apps/web/src/features/decks/viewmodels/deck-sections.ts
// Helpers de apresentação (sem hooks, sem JSX): agrupam main + egg em seções
// legíveis, calculam a curva de custo e normalizam as cores dominantes. Usam os
// metadados das cartas (feature cards) quando disponíveis; sem eles, a carta cai
// em "Outros" com o próprio cardId.
import { ATTRIBUTE_COLORS, type AttributeColor } from '@/components'
import type { CardColor, CardSummary, CardType } from '@/features/cards/model/types'
import type { DeckCardEntry } from '../model/types'

export interface SectionCard {
  cardId: string
  quantity: number
  name: string
  number: string | null
  type: CardType | 'unknown'
  level: number | null
  playCost: number | null
  colors: CardColor[]
}

export interface DeckSection {
  key: string
  title: string
  items: SectionCard[]
  total: number
}

export interface DeckSectionGroup {
  sections: DeckSection[]
  mainCount: number
  eggCount: number
  total: number
}

export interface DeckCurveBucket {
  cost: number
  count: number
}

export interface DeckCurve {
  buckets: DeckCurveBucket[]
  maxCost: number
}

export type CardMetadataMap = Record<string, CardSummary>

function toSectionCard(entry: DeckCardEntry, card: CardSummary | undefined): SectionCard {
  return {
    cardId: entry.cardId,
    quantity: entry.quantity,
    name: card?.name ?? entry.cardId,
    number: card?.number ?? null,
    type: card?.type ?? 'unknown',
    level: card?.level ?? null,
    playCost: card?.playCost ?? null,
    colors: card?.colors ?? []
  }
}

function sumQuantities(items: SectionCard[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

function sortByNumber(items: SectionCard[]): SectionCard[] {
  return [...items].sort((a, b) => (a.number ?? a.cardId).localeCompare(b.number ?? b.cardId))
}

/** Agrupa main + egg: Eggs → Digimon por nível → Tamers → Options → Outros. */
export function groupDeckSections(
  cardList: DeckCardEntry[],
  eggList: DeckCardEntry[],
  metadata: CardMetadataMap
): DeckSectionGroup {
  const main = cardList.map((entry) => toSectionCard(entry, metadata[entry.cardId]))
  const eggs = eggList.map((entry) => toSectionCard(entry, metadata[entry.cardId]))

  const sections: DeckSection[] = []
  if (eggs.length > 0) {
    sections.push({ key: 'egg', title: 'Egg Deck', items: sortByNumber(eggs), total: sumQuantities(eggs) })
  }

  const digimonByLevel = new Map<number, SectionCard[]>()
  const tamers: SectionCard[] = []
  const options: SectionCard[] = []
  const others: SectionCard[] = []

  for (const card of main) {
    if (card.type === 'digimon') {
      const level = card.level ?? 0
      const bucket = digimonByLevel.get(level) ?? []
      bucket.push(card)
      digimonByLevel.set(level, bucket)
    } else if (card.type === 'tamer') {
      tamers.push(card)
    } else if (card.type === 'option') {
      options.push(card)
    } else {
      others.push(card)
    }
  }

  for (const level of [...digimonByLevel.keys()].sort((a, b) => a - b)) {
    const items = sortByNumber(digimonByLevel.get(level) ?? [])
    sections.push({
      key: `digimon-${level}`,
      title: level > 0 ? `Digimon · Nível ${level}` : 'Digimon',
      items,
      total: sumQuantities(items)
    })
  }

  if (tamers.length > 0) {
    sections.push({ key: 'tamer', title: 'Tamers', items: sortByNumber(tamers), total: sumQuantities(tamers) })
  }
  if (options.length > 0) {
    sections.push({ key: 'option', title: 'Options', items: sortByNumber(options), total: sumQuantities(options) })
  }
  if (others.length > 0) {
    sections.push({ key: 'other', title: 'Outros', items: sortByNumber(others), total: sumQuantities(others) })
  }

  const mainItems = [...digimonByLevel.values()].flat().concat(tamers, options, others)
  return {
    sections,
    mainCount: sumQuantities(mainItems),
    eggCount: sumQuantities(eggs),
    total: sumQuantities(mainItems) + sumQuantities(eggs)
  }
}

/** Curva de custo (playCost) do main deck, em buckets inteiros 0..maxCost. */
export function deckCurve(cardList: DeckCardEntry[], metadata: CardMetadataMap): DeckCurve {
  const counts = new Map<number, number>()
  let maxCost = 0
  for (const entry of cardList) {
    const card = metadata[entry.cardId]
    if (!card || card.playCost == null) continue
    counts.set(card.playCost, (counts.get(card.playCost) ?? 0) + entry.quantity)
    maxCost = Math.max(maxCost, card.playCost)
  }
  const buckets: DeckCurveBucket[] = []
  for (let cost = 0; cost <= maxCost; cost += 1) {
    buckets.push({ cost, count: counts.get(cost) ?? 0 })
  }
  return { buckets, maxCost }
}

/** Cores dominantes do deck (até 3), normalizadas para atributos conhecidos. */
export function dominantColors(colors: string[]): AttributeColor[] {
  const known = colors.filter((color): color is AttributeColor => color in ATTRIBUTE_COLORS)
  return known.slice(0, 3)
}
