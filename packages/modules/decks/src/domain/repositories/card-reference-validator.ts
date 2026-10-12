// Path: packages/modules/decks/src/domain/repositories/card-reference-validator.ts
// Validação de referência do cardList/eggList às Cartas do @digimon/cards.
// Interface (DIP): a implementação concreta vive no composition root (container
// do apps/api, usa @digimon/cards) — o módulo decks nunca importa outro módulo.
import type { DeckCardEntry } from '../entities/deck'

/** Ficha de referência de uma carta do deck (existência + regras de legalidade). */
export interface CardReferenceInfo {
  cardId: string
  quantity: number
  exists: boolean
  maxCountInDeck: number
  isDigiEgg: boolean
}

export interface CardReferenceValidator {
  /** Lança ValidationError se alguma carta não existir no catálogo. */
  assertCardsExist(entries: DeckCardEntry[]): Promise<void>
  /** Inspeciona as cartas (existência, tipo, limite de cópias) para a legalidade. */
  inspect(entries: DeckCardEntry[]): Promise<CardReferenceInfo[]>
}
