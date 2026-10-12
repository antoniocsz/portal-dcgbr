// Path: packages/modules/decks/src/domain/deck-list/deck-list.spec.ts
// Critérios da task 63 (import/export de decklist):
// - parseDeckList cobre os 3 formatos de texto + Tabletop Simulator + comentários
// - normalização de número (`ST01-01` → `ST1-01`)
// - Digi-Egg → eggList; desconhecidas → skipped; caps → trimmed (main 50 / egg 5 / por carta)
// - serializeDeckList round-trip com parseDeckList
import { describe, expect, it } from 'vitest'
import type { DeckCardEntry } from '../entities/deck'
import { normalizeCardNumber, parseDeckList } from './parse-deck-list'
import { serializeDeckList } from './serialize-deck-list'
import type { DeckCardResolver, ResolvedDeckCard, SerializableDeckList } from './types'

const CATALOG: ResolvedDeckCard[] = [
  { cardId: 'card-agumon', number: 'BT1-009', name: 'Agumon', isDigiEgg: false, maxCountInDeck: 50 },
  { cardId: 'card-gabumon', number: 'BT1-028', name: 'Gabumon', isDigiEgg: false, maxCountInDeck: 50 },
  { cardId: 'card-limited', number: 'BT2-001', name: 'Limited', isDigiEgg: false, maxCountInDeck: 1 },
  { cardId: 'card-st1', number: 'ST1-01', name: 'Koromon', isDigiEgg: true, maxCountInDeck: 50 },
  { cardId: 'card-egg', number: 'BT1-001', name: 'Botamon', isDigiEgg: true, maxCountInDeck: 50 },
  ...Array.from(
    { length: 13 },
    (_, index): ResolvedDeckCard => ({
      cardId: `main-${index + 1}`,
      number: `BT3-${String(index + 1).padStart(3, '0')}`,
      name: `Main ${index + 1}`,
      isDigiEgg: false,
      maxCountInDeck: 50
    })
  )
]

class FakeDeckCardResolver implements DeckCardResolver {
  private readonly byNumber = new Map<string, ResolvedDeckCard>()
  private readonly byId = new Map<string, ResolvedDeckCard>()

  constructor(cards: ResolvedDeckCard[]) {
    for (const card of cards) {
      this.byNumber.set(card.number, card)
      this.byId.set(card.cardId, card)
    }
  }

  async resolveByNumber(number: string): Promise<ResolvedDeckCard | undefined> {
    return this.byNumber.get(number)
  }

  async resolveById(cardId: string): Promise<ResolvedDeckCard | undefined> {
    return this.byId.get(cardId)
  }
}

const resolver = new FakeDeckCardResolver(CATALOG)

function sortEntries(entries: DeckCardEntry[]): DeckCardEntry[] {
  return [...entries].sort((a, b) => a.cardId.localeCompare(b.cardId))
}

describe('normalizeCardNumber', () => {
  it('faz uppercase e remove zeros à esquerda do set', () => {
    expect(normalizeCardNumber('st01-01')).toBe('ST1-01')
    expect(normalizeCardNumber('BT1-009')).toBe('BT1-009')
    expect(normalizeCardNumber('EX02-070')).toBe('EX2-070')
  })
})

describe('parseDeckList — formatos de texto', () => {
  it('formato DigimonCard.io: `4 Agumon BT1-009`', async () => {
    const result = await parseDeckList('4 Agumon BT1-009', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
    expect(result.eggList).toEqual([])
    expect(result.skipped).toEqual([])
    expect(result.trimmed).toEqual([])
  })

  it('formato Untap: `4 Agumon (DCG) (BT1-009)`', async () => {
    const result = await parseDeckList('4 Agumon (DCG) (BT1-009)', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
  })

  it('ordem custom: `BT1-009 Agumon 4`', async () => {
    const result = await parseDeckList('BT1-009 Agumon 4', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
  })

  it('conta prefixo, sufixo, `4x`/`x4` e default 1', async () => {
    const text = [
      '4 Agumon BT1-009',
      'BT1-028 Gabumon 3',
      '2x Agumon BT1-009',
      'x2 Gabumon BT1-028',
      'Agumon BT1-009'
    ].join('\n')
    const result = await parseDeckList(text, resolver)
    expect(result.cardList).toEqual([
      { cardId: 'card-agumon', quantity: 7 },
      { cardId: 'card-gabumon', quantity: 5 }
    ])
  })

  it('ignora comentários (// e #), linhas vazias e linhas sem código', async () => {
    const text = [
      '// DigimonCard.io Deck List',
      '# meu deck',
      '',
      'Deck do Agumon',
      '4 Agumon BT1-009'
    ].join('\n')
    const result = await parseDeckList(text, resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
  })

  it('normaliza zeros à esquerda do set (`ST01-01` → `ST1-01`)', async () => {
    const result = await parseDeckList('4 Koromon ST01-01', resolver)
    expect(result.eggList).toEqual([{ cardId: 'card-st1', quantity: 4 }])
  })

  it('remove o sufixo de arte `_P1` para achar a carta', async () => {
    const result = await parseDeckList('3 Agumon BT1-009_P1', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 3 }])
  })

  it('Digi-Egg vai para eggList; demais para cardList', async () => {
    const result = await parseDeckList('4 Botamon BT1-001\n4 Agumon BT1-009', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
    expect(result.eggList).toEqual([{ cardId: 'card-egg', quantity: 4 }])
  })
})

describe('parseDeckList — Tabletop Simulator', () => {
  it('array JSON de códigos: uma cópia por item', async () => {
    const tts = JSON.stringify([
      'Exported from digimonmeta.com',
      'BT1-009',
      'BT1-009',
      'BT1-028'
    ])
    const result = await parseDeckList(tts, resolver)
    expect(result.cardList).toEqual([
      { cardId: 'card-agumon', quantity: 2 },
      { cardId: 'card-gabumon', quantity: 1 }
    ])
    expect(result.skipped).toEqual([])
  })

  it('é tolerante a colchete faltando', async () => {
    const tts = '"Exported from digimonmeta.com","ST1-01","ST1-01"'
    const result = await parseDeckList(tts, resolver)
    expect(result.eggList).toEqual([{ cardId: 'card-st1', quantity: 2 }])
  })
})

describe('parseDeckList — skipped e trimmed', () => {
  it('cartas desconhecidas vão para skipped', async () => {
    const result = await parseDeckList('4 Fantasma BT9-999\n4 Agumon BT1-009', resolver)
    expect(result.skipped).toEqual(['BT9-999'])
    expect(result.cardList).toEqual([{ cardId: 'card-agumon', quantity: 4 }])
  })

  it('aplica o limite por carta (maxCountInDeck) → trimmed', async () => {
    const result = await parseDeckList('3 Limited BT2-001', resolver)
    expect(result.cardList).toEqual([{ cardId: 'card-limited', quantity: 1 }])
    expect(result.trimmed).toEqual([{ cardId: 'card-limited', quantity: 2 }])
  })

  it('aplica o cap de 50 no main → trimmed', async () => {
    const lines = Array.from(
      { length: 13 },
      (_, index) => `4 Main ${index + 1} BT3-${String(index + 1).padStart(3, '0')}`
    )
    const result = await parseDeckList(lines.join('\n'), resolver)
    const total = result.cardList.reduce((sum, entry) => sum + entry.quantity, 0)
    const trimmedTotal = result.trimmed.reduce((sum, entry) => sum + entry.quantity, 0)
    expect(total).toBe(50)
    expect(trimmedTotal).toBe(2)
  })

  it('aplica o cap de 5 no egg → trimmed', async () => {
    const result = await parseDeckList('4 Koromon ST1-01\n4 Botamon BT1-001', resolver)
    const total = result.eggList.reduce((sum, entry) => sum + entry.quantity, 0)
    const trimmedTotal = result.trimmed.reduce((sum, entry) => sum + entry.quantity, 0)
    expect(total).toBe(5)
    expect(trimmedTotal).toBe(3)
  })
})

describe('serializeDeckList — formato DigimonCard.io', () => {
  it('cabeçalho, egg antes do main, linhas `<qty> <name> <number>`', async () => {
    const deck: SerializableDeckList = {
      cardList: [
        { cardId: 'card-gabumon', quantity: 4 },
        { cardId: 'card-agumon', quantity: 3 }
      ],
      eggList: [{ cardId: 'card-st1', quantity: 4 }]
    }
    const text = await serializeDeckList(deck, resolver)
    expect(text).toBe(
      [
        '// DigimonCard.io Deck List',
        '4 Koromon ST1-01',
        '',
        '3 Agumon BT1-009',
        '4 Gabumon BT1-028',
        ''
      ].join('\n')
    )
  })
})

describe('serializeDeckList ↔ parseDeckList — round-trip', () => {
  it('preserva cardList e eggList', async () => {
    const deck: SerializableDeckList = {
      cardList: [
        { cardId: 'card-gabumon', quantity: 4 },
        { cardId: 'card-agumon', quantity: 4 }
      ],
      eggList: [{ cardId: 'card-st1', quantity: 2 }]
    }

    const text = await serializeDeckList(deck, resolver)
    const parsed = await parseDeckList(text, resolver)

    expect(sortEntries(parsed.cardList)).toEqual(sortEntries(deck.cardList))
    expect(parsed.eggList).toEqual(deck.eggList)
    expect(parsed.skipped).toEqual([])
    expect(parsed.trimmed).toEqual([])
  })
})
