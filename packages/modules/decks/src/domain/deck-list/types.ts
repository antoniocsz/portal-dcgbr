// Path: packages/modules/decks/src/domain/deck-list/types.ts
// Tipos e porta (DIP) do import/export de decklist. O resolvedor concreto
// (Prisma / @digimon/cards) é plugado no composition root das rotas; aqui só
// vive a interface — o módulo decks nunca importa outro módulo.
import type { DeckCardEntry } from '../entities/deck'

/** Dados de catálogo de uma carta usados no parse e na serialização. */
export interface ResolvedDeckCard {
  cardId: string
  /** Número de referência da carta (ex.: `BT1-009`). */
  number: string
  /** Nome da carta (usado na serialização). */
  name: string
  isDigiEgg: boolean
  /** Limite de cópias por deck (default 4 quando ausente). */
  maxCountInDeck?: number
}

/** Resolvedor de cartas (DIP) — código ↔ cardId do catálogo. */
export interface DeckCardResolver {
  /** Número normalizado (ex.: `BT1-009`) → carta do catálogo. */
  resolveByNumber(number: string): Promise<ResolvedDeckCard | undefined>
  /** cardId interno → dados da carta (usado na serialização). */
  resolveById(cardId: string): Promise<ResolvedDeckCard | undefined>
}

export interface DeckListParseResult {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
  /** Códigos de carta não encontrados no catálogo. */
  skipped: string[]
  /** Cópias removidas pelos caps (main 50 / egg 5 / limite por carta). */
  trimmed: DeckCardEntry[]
}

/** Entrada mínima do serializador (subconjunto de `DeckData`). */
export interface SerializableDeckList {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
}
