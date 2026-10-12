// Path: packages/modules/decks/src/domain/deck-list/serialize-deck-list.ts
// Serializa um deck no formato DigimonCard.io: cabeçalho, bloco de egg antes do
// bloco principal, cartas agrupadas e ordenadas por número, linhas
// `<qty> <name> <number>`. Round-trip com `parseDeckList` via `DeckCardResolver`.
import type { DeckCardEntry } from '../entities/deck'
import type { DeckCardResolver, SerializableDeckList } from './types'

interface SerializedLine {
  quantity: number
  name: string
  number: string
}

export async function serializeDeckList(
  deck: SerializableDeckList,
  resolver: DeckCardResolver
): Promise<string> {
  const eggLines = await serializeZone(deck.eggList, resolver)
  const mainLines = await serializeZone(deck.cardList, resolver)

  const lines = ['// DigimonCard.io Deck List']
  if (eggLines.length > 0) lines.push(...eggLines)
  if (eggLines.length > 0 && mainLines.length > 0) lines.push('')
  if (mainLines.length > 0) lines.push(...mainLines)

  return `${lines.join('\n')}\n`
}

async function serializeZone(
  entries: DeckCardEntry[],
  resolver: DeckCardResolver
): Promise<string[]> {
  const resolved: SerializedLine[] = []
  for (const [cardId, quantity] of mergeQuantities(entries)) {
    const card = await resolver.resolveById(cardId)
    resolved.push({
      quantity,
      name: card?.name ?? cardId,
      number: card?.number ?? cardId
    })
  }
  resolved.sort((a, b) => compareCardNumbers(a.number, b.number))
  return resolved.map((line) => `${line.quantity} ${line.name} ${line.number}`)
}

function mergeQuantities(entries: DeckCardEntry[]): Map<string, number> {
  const merged = new Map<string, number>()
  for (const entry of entries) {
    merged.set(entry.cardId, (merged.get(entry.cardId) ?? 0) + entry.quantity)
  }
  return merged
}

function compareCardNumbers(a: string, b: string): number {
  const [setA, numberA] = a.split('-')
  const [setB, numberB] = b.split('-')
  if (setA !== setB) return (setA ?? '') < (setB ?? '') ? -1 : 1
  return (Number(numberA) || 0) - (Number(numberB) || 0)
}
