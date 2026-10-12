// Path: packages/modules/decks/src/use-cases/check-deck-legality.ts
// Verifica a legalidade de composição de um deck (lista dupla main + egg).
// Decisão D1/D3 (sem banlist nesta fase). Recebe o CardReferenceValidator
// (DIP) e usa `inspect` para obter existência, tipo (Digi-Egg) e limite de
// cópias por carta. Não persiste nada — puro cálculo de regras.
import { DEFAULT_MAX_COUNT_IN_DECK, EGG_DECK_SIZE, MAIN_DECK_SIZE } from '../domain/deck-sizes'
import type { DeckCardEntry } from '../domain/entities/deck'
import type { CardReferenceInfo, CardReferenceValidator } from '../domain/repositories/card-reference-validator'

// Reexporta as constantes canônicas (fonte: domain/deck-sizes) para manter o
// contrato do barrel público do módulo estável.
export { DEFAULT_MAX_COUNT_IN_DECK, EGG_DECK_SIZE, MAIN_DECK_SIZE } from '../domain/deck-sizes'

export type DeckLegalityViolationCode =
  | 'main_deck_size'
  | 'egg_deck_size'
  | 'copy_limit'
  | 'unknown_card'
  | 'wrong_zone'

export interface DeckLegalityViolation {
  code: DeckLegalityViolationCode
  cardId?: string
  message: string
}

export interface DeckLegalityResult {
  legal: boolean
  mainCount: number
  eggCount: number
  violations: DeckLegalityViolation[]
}

export interface CheckDeckLegalityCommand {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
}

export class CheckDeckLegalityUseCase {
  constructor(private readonly cards: CardReferenceValidator) {}

  async execute(command: CheckDeckLegalityCommand): Promise<DeckLegalityResult> {
    const mainInfo = await this.cards.inspect(command.cardList)
    const eggInfo = await this.cards.inspect(command.eggList)

    const mainCount = sumQuantities(mainInfo)
    const eggCount = sumQuantities(eggInfo)
    const violations: DeckLegalityViolation[] = []

    if (mainCount !== MAIN_DECK_SIZE) {
      violations.push({
        code: 'main_deck_size',
        message: `Main deck deve ter exatamente ${MAIN_DECK_SIZE} cartas (atual: ${mainCount})`
      })
    }

    if (eggCount > EGG_DECK_SIZE) {
      violations.push({
        code: 'egg_deck_size',
        message: `Egg deck deve ter no máximo ${EGG_DECK_SIZE} cartas (atual: ${eggCount})`
      })
    }

    collectZoneViolations(mainInfo, eggInfo, violations)
    collectCopyLimitViolations([...mainInfo, ...eggInfo], violations)

    return { legal: violations.length === 0, mainCount, eggCount, violations }
  }
}

function sumQuantities(entries: CardReferenceInfo[]): number {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0)
}

/** Existência + zona: Digi-Egg só na eggList; não-Digi-Egg só no cardList. */
function collectZoneViolations(
  mainInfo: CardReferenceInfo[],
  eggInfo: CardReferenceInfo[],
  violations: DeckLegalityViolation[]
): void {
  for (const info of [...mainInfo, ...eggInfo]) {
    if (!info.exists) {
      violations.push({
        code: 'unknown_card',
        cardId: info.cardId,
        message: `Carta não encontrada no catálogo: ${info.cardId}`
      })
    }
  }

  for (const info of mainInfo) {
    if (info.exists && info.isDigiEgg) {
      violations.push({
        code: 'wrong_zone',
        cardId: info.cardId,
        message: `Carta Digi-Egg "${info.cardId}" deve ficar na egg deck, não no main deck`
      })
    }
  }

  for (const info of eggInfo) {
    if (info.exists && !info.isDigiEgg) {
      violations.push({
        code: 'wrong_zone',
        cardId: info.cardId,
        message: `Carta "${info.cardId}" não é Digi-Egg e não pode ficar na egg deck`
      })
    }
  }
}

/** Limite de cópias somando main + egg (default 4). Cartas inexistentes ficam fora. */
function collectCopyLimitViolations(
  entries: CardReferenceInfo[],
  violations: DeckLegalityViolation[]
): void {
  const totals = new Map<string, { quantity: number; max: number }>()
  for (const info of entries) {
    if (!info.exists) continue
    const max = info.maxCountInDeck || DEFAULT_MAX_COUNT_IN_DECK
    const current = totals.get(info.cardId) ?? { quantity: 0, max }
    current.quantity += info.quantity
    totals.set(info.cardId, current)
  }

  for (const [cardId, total] of totals) {
    if (total.quantity > total.max) {
      violations.push({
        code: 'copy_limit',
        cardId,
        message: `Carta "${cardId}" excede o limite de ${total.max} cópias (atual: ${total.quantity})`
      })
    }
  }
}
