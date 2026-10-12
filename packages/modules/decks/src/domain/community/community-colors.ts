// Path: packages/modules/decks/src/domain/community/community-colors.ts
// Cores dominantes do snapshot (até 3), calculadas a partir dos metadados das
// cartas do cardList. `DeckColorResolver` é DIP: a impl concreta (Prisma /
// @digimon/cards) vive no composition root — o módulo só define a interface e
// a regra pura de contagem.
import type { DeckCardEntry } from '../entities/deck'

/** Cores (CardColor) de uma carta do deck. */
export interface CardColorInfo {
  cardId: string
  colors: string[]
}

/** Resolve as cores das cartas do cardList (metadados de carta). */
export interface DeckColorResolver {
  resolveColors(entries: DeckCardEntry[]): Promise<CardColorInfo[]>
}

export const COMMUNITY_MAX_COLORS = 3

/**
 * Cores dominantes do deck: soma a quantidade de cada carta por cor e devolve
 * até `limit` cores em ordem decrescente (empate resolvido pelo nome da cor).
 */
export function dominantColors(
  cardList: DeckCardEntry[],
  cardColors: CardColorInfo[],
  limit: number = COMMUNITY_MAX_COLORS
): string[] {
  const byCard = new Map(cardColors.map((info) => [info.cardId, info.colors]))
  const tally = new Map<string, number>()

  for (const entry of cardList) {
    const colors = byCard.get(entry.cardId) ?? []
    for (const color of colors) {
      tally.set(color, (tally.get(color) ?? 0) + entry.quantity)
    }
  }

  return [...tally.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([color]) => color)
}
