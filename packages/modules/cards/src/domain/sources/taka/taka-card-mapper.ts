// Path: packages/modules/cards/src/domain/sources/taka/taka-card-mapper.ts
// Mapper puro do registro da fonte TakaOtaku/Digimon-Card-App → CardImportInput.
// Sem I/O. Registros de tipo não reconhecido retornam `null` (linha ignorada).
//
// A fonte real usa "-" como placeholder de vazio em vários campos
// (effect/digivolveEffect/securityEffect/attribute/type/cardLv/dp/playCost) —
// tratamos "-" como ausente. `digivolveCondition[].level`/`cost` são STRINGS
// (podendo ser "Ult."/"Tamer"), então níveis não numéricos são descartados.
import type { CardColor, CardType, EvolutionCondition } from '../../entities/card'
import type { RawSourceCard } from '../card-source-provider'

/** Traço (digiType) da fonte — ex.: "Dinosaur/ADVENTURE". `type` é o traço. */
export interface TakaCardRecord extends RawSourceCard {
  cardNumber?: string
  cardType?: string
  color?: string
  cardLv?: string
  dp?: string
  playCost?: string
  rarity?: string
  attribute?: string
  type?: string
  effect?: string
  digivolveEffect?: string
  securityEffect?: string
  name?: { english?: string }
  digivolveCondition?: { color?: string; level?: string; cost?: string }[]
  /** Nome da expansão (com código) — base da derivação de sets; ver taka-set-derivation. */
  notes?: string
}

/** Carta normalizada, pronta para o `ImportCardsUseCase` (estruturalmente = CardInput). */
export interface CardImportInput {
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
}

const CARD_TYPE_MAP: Record<string, CardType> = {
  Digimon: 'digimon',
  Tamer: 'tamer',
  Option: 'option',
  'Digi-Egg': 'digiegg',
  'Digimon/Option': 'digimon'
}

const COLOR_MAP: Record<string, CardColor> = {
  Red: 'red',
  Blue: 'blue',
  Yellow: 'yellow',
  Green: 'green',
  Purple: 'purple',
  Black: 'black',
  White: 'white'
}

const ALL_COLORS: CardColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'black', 'white']

const TAKA_IMAGE_BASE = 'https://world.digimoncard.com/images/cardlist/card'

/** Limpa NBSP/quebras e devolve `null` para vazio ou placeholder "-". */
function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned === '' || cleaned === '-' ? null : cleaned
}

/** Normaliza texto longo preservando quebras de linha; "-" vira `null`. */
function cleanEffect(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n').trim()
  return cleaned === '' || cleaned === '-' ? null : cleaned
}

/** Interpreta um inteiro não negativo; qualquer outro formato vira `null`. */
function toInt(value: unknown): number | null {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return /^\d+$/.test(trimmed) ? Number.parseInt(trimmed, 10) : null
}

function mapColors(raw: unknown): CardColor[] {
  if (typeof raw !== 'string') return []
  const colors = new Set<CardColor>()
  for (const token of raw.split('/')) {
    const color = COLOR_MAP[token.trim()]
    if (color) colors.add(color)
  }
  return [...colors]
}

function mapLevel(raw: unknown): number | null {
  const text = cleanText(raw)
  if (!text) return null
  const match = /^Lv\.(\d+)$/.exec(text)
  return match ? Number.parseInt(match[1] ?? '', 10) : null
}

function mapEvolutionConditions(raw: unknown): EvolutionCondition[] {
  if (!Array.isArray(raw)) return []
  const conditions: EvolutionCondition[] = []
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { color, level, cost } = item as { color?: unknown; level?: unknown; cost?: unknown }
    const parsedLevel = toInt(level)
    if (parsedLevel === null || parsedLevel < 1) continue
    const parsedCost = toInt(cost) ?? 0
    const colorToken = typeof color === 'string' ? color.trim() : ''

    const targetColors: CardColor[] = []
    if (colorToken === 'All') {
      targetColors.push(...ALL_COLORS)
    } else {
      const mapped = COLOR_MAP[colorToken]
      if (mapped) targetColors.push(mapped)
    }
    for (const target of targetColors) {
      conditions.push({ color: target, level: parsedLevel, cost: parsedCost })
    }
  }
  return conditions
}

function mapEffects(record: TakaCardRecord): string | null {
  const parts = [record.effect, record.digivolveEffect, record.securityEffect]
    .map(cleanEffect)
    .filter((part): part is string => part !== null)
  return parts.length > 0 ? parts.join('\n\n') : null
}

/** Mapeia um registro TakaOtaku para o input de importação; `null` se não reconhecido. */
export function mapTakaCard(raw: TakaCardRecord): CardImportInput | null {
  const number = cleanText(raw.cardNumber)
  const name = cleanText(raw.name?.english)
  const type = CARD_TYPE_MAP[cleanText(raw.cardType) ?? '']
  if (!number || !name || !type) return null

  const colors = mapColors(raw.color)
  if (colors.length === 0) return null

  const rarity = typeof raw.rarity === 'string' ? raw.rarity.trim() : ''

  return {
    dcgId: number,
    name,
    number,
    rarity: rarity || number,
    type,
    colors,
    level: mapLevel(raw.cardLv),
    digiType: cleanText(raw.type),
    attribute: cleanText(raw.attribute),
    dp: toInt(raw.dp),
    playCost: toInt(raw.playCost),
    evolutionConditions: mapEvolutionConditions(raw.digivolveCondition),
    effects: mapEffects(raw),
    imageUrl: `${TAKA_IMAGE_BASE}/${number}.png`,
    setCode: number.split('-')[0] ?? null,
    releaseDate: null
  }
}
