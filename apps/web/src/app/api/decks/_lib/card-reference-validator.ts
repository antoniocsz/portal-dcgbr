// Path: apps/web/src/app/api/decks/_lib/card-reference-validator.ts
// Implementação concreta de CardReferenceValidator (interface do domínio
// @digimon/decks): valida que cada cardId do cardList existe no catálogo de
// cartas (@digimon/cards) via o PrismaClient singleton (@digimon/database).
// Vive no composition root do app — o módulo decks nunca importa outro módulo.
import type { DeckCardEntry } from '@digimon/decks'
import { prisma } from '@digimon/database'
import { ValidationError } from '@digimon/contracts'

export class PrismaCardReferenceValidator {
  async assertCardsExist(cardList: DeckCardEntry[]): Promise<void> {
    const ids = [...new Set(cardList.map((entry) => entry.cardId))]
    if (ids.length === 0) return

    const found = await prisma.card.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    })
    const foundIds = new Set(found.map((card) => card.id))
    const missing = ids.filter((id) => !foundIds.has(id))
    if (missing.length > 0) {
      throw new ValidationError(`Cartas não encontradas no catálogo: ${missing.join(', ')}`)
    }
  }
}
