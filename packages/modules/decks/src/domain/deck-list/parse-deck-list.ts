// Path: packages/modules/decks/src/domain/deck-list/parse-deck-list.ts
// Parser de decklist (função pura quanto possível — o único I/O é via
// `DeckCardResolver` injetado, DIP). Aceita:
//   1. lista de texto (DigimonCard.io / digimoncard.app / DCGO / Untap /
//      ordem custom), uma carta por linha, em qualquer ordem;
//   2. array JSON de códigos do Tabletop Simulator (uma cópia por item).
// Normaliza o número, resolve para cardId, separa main/egg, aplica caps
// (main 50 / egg 5 / limite por carta) e reporta `skipped`/`trimmed`.
import { DEFAULT_MAX_COUNT_IN_DECK, EGG_DECK_SIZE, MAIN_DECK_SIZE } from '../deck-sizes'
import type { DeckCardEntry } from '../entities/deck'
import type { DeckCardResolver, DeckListParseResult, ResolvedDeckCard } from './types'

// Código de carta (base) + sufixo de arte opcional `_P1` (grupo 2).
const CARD_CODE_PATTERN = /\b([A-Z]{1,3}\d{0,2}-\d{2,3})(?:_(P\d+))?\b/gi

interface RawEntry {
  number: string
  quantity: number
}

interface CodeMatch {
  number: string
  index: number
  length: number
}

interface Accumulator {
  card: ResolvedDeckCard
  quantity: number
}

/** Normaliza um código de carta: uppercase + remove zeros à esquerda do set. */
export function normalizeCardNumber(raw: string): string {
  const normalized = raw.trim().toUpperCase()
  const dash = normalized.indexOf('-')
  if (dash === -1) return normalized

  const set = normalized.slice(0, dash)
  const number = normalized.slice(dash + 1)
  const setMatch = /^([A-Z]+)(\d+)$/.exec(set)
  if (!setMatch) return `${set}-${number}`

  const prefix = setMatch[1] ?? ''
  const digits = setMatch[2] ?? ''
  return `${prefix}${Number(digits)}-${number}`
}

/** Extrai o primeiro código de carta da linha e sua posição (número normalizado). */
function matchCode(text: string): CodeMatch | null {
  CARD_CODE_PATTERN.lastIndex = 0
  const match = CARD_CODE_PATTERN.exec(text)
  if (!match) return null
  return {
    number: normalizeCardNumber(match[1] ?? ''),
    index: match.index,
    length: match[0]?.length ?? 0
  }
}

/** Contagem: prefixo (`4 Agumon`), sufixo (`Agumon 4`) ou `4x`/`x4`; default 1. */
function extractQuantity(rest: string): number {
  const trailingTimes = /\b(\d+)\s*[xX]\b/.exec(rest)
  if (trailingTimes) return toPositiveInt(trailingTimes[1])

  const leadingTimes = /\b[xX](\d+)\b/.exec(rest)
  if (leadingTimes) return toPositiveInt(leadingTimes[1])

  const plain = /\b(\d+)\b/.exec(rest)
  if (plain) return toPositiveInt(plain[1])

  return 1
}

function toPositiveInt(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function parseTextLines(text: string): RawEntry[] {
  const entries: RawEntry[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('#')) continue

    const code = matchCode(trimmed)
    if (!code) continue

    const rest = `${trimmed.slice(0, code.index)} ${trimmed.slice(code.index + code.length)}`
    entries.push({ number: code.number, quantity: extractQuantity(rest) })
  }
  return entries
}

function parseTabletopSimulator(text: string): RawEntry[] {
  const entries: RawEntry[] = []
  for (const value of extractQuotedStrings(text)) {
    const code = matchCode(value)
    if (!code) continue
    entries.push({ number: code.number, quantity: 1 })
  }
  return entries
}

/** Lê todas as strings entre aspas (tolerante a colchete faltando). */
function extractQuotedStrings(text: string): string[] {
  const values: string[] = []
  const pattern = /"((?:[^"\\]|\\.)*)"/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    values.push(match[1] ?? '')
  }
  return values
}

function looksLikeTabletopSimulator(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.startsWith('[')) return true
  return trimmed.startsWith('"') && trimmed.includes(',')
}

export async function parseDeckList(
  text: string,
  resolver: DeckCardResolver
): Promise<DeckListParseResult> {
  const raw = looksLikeTabletopSimulator(text) ? parseTabletopSimulator(text) : parseTextLines(text)

  const skipped: string[] = []
  const trimmed: DeckCardEntry[] = []
  const main = new Map<string, Accumulator>()
  const egg = new Map<string, Accumulator>()

  for (const entry of raw) {
    const card = await resolver.resolveByNumber(entry.number)
    if (!card) {
      skipped.push(entry.number)
      continue
    }

    const target = card.isDigiEgg ? egg : main
    const current = target.get(card.cardId)
    if (current) current.quantity += entry.quantity
    else target.set(card.cardId, { card, quantity: entry.quantity })
  }

  const cardList = applyCopyLimit(main, trimmed)
  const eggList = applyCopyLimit(egg, trimmed)

  return {
    cardList: applyZoneCap(cardList, MAIN_DECK_SIZE, trimmed),
    eggList: applyZoneCap(eggList, EGG_DECK_SIZE, trimmed),
    skipped,
    trimmed
  }
}

/** Limita cada carta ao `maxCountInDeck`; excedente vai para `trimmed`. */
function applyCopyLimit(
  acc: Map<string, Accumulator>,
  trimmed: DeckCardEntry[]
): DeckCardEntry[] {
  const list: DeckCardEntry[] = []
  for (const [cardId, entry] of acc) {
    const max = resolveMaxCount(entry.card)
    const kept = Math.min(entry.quantity, max)
    if (entry.quantity > kept) trimmed.push({ cardId, quantity: entry.quantity - kept })
    if (kept > 0) list.push({ cardId, quantity: kept })
  }
  return list
}

function resolveMaxCount(card: ResolvedDeckCard): number {
  return card.maxCountInDeck && card.maxCountInDeck > 0
    ? card.maxCountInDeck
    : DEFAULT_MAX_COUNT_IN_DECK
}

/** Limita o total da zona (main 50 / egg 5); excedente vai para `trimmed`. */
function applyZoneCap(
  list: DeckCardEntry[],
  cap: number,
  trimmed: DeckCardEntry[]
): DeckCardEntry[] {
  let total = list.reduce((sum, entry) => sum + entry.quantity, 0)
  if (total <= cap) return list

  const result: DeckCardEntry[] = []
  for (const entry of list) {
    if (total <= cap) {
      result.push(entry)
      continue
    }
    const remove = Math.min(total - cap, entry.quantity)
    const kept = entry.quantity - remove
    if (remove > 0) trimmed.push({ cardId: entry.cardId, quantity: remove })
    if (kept > 0) result.push({ cardId: entry.cardId, quantity: kept })
    total -= remove
  }
  return result
}
