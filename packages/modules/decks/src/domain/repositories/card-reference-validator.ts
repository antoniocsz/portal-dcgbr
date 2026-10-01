// Path: packages/modules/decks/src/domain/repositories/card-reference-validator.ts
// Validação de referência do cardList às Cartas do @digimon/cards (existência).
// Interface (DIP): a implementação concreta vive no composition root do
// apps/web (usa @digimon/cards) — o módulo decks nunca importa outro módulo.
import type { DeckCardEntry } from '../entities/deck'

export interface CardReferenceValidator {
  /** Lança ValidationError se alguma carta não existir no catálogo. */
  assertCardsExist(cardList: DeckCardEntry[]): Promise<void>
}
