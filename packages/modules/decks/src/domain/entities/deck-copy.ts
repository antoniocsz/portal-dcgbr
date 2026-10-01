// Path: packages/modules/decks/src/domain/entities/deck-copy.ts
// Registro de cópia: um deck copiado por outro usuário vira deck próprio do
// copiador (deck.copied). Valor de auditoria/estatística — sem regras próprias.

export interface DeckCopyData {
  id: string
  sourceDeckId: string
  copiedById: string
  createdAt: Date
}

export class DeckCopy {
  private constructor(public readonly data: DeckCopyData) {}

  static create(props: Omit<DeckCopyData, 'createdAt'>): DeckCopy {
    return new DeckCopy({ ...props, createdAt: new Date() })
  }

  static fromData(data: DeckCopyData): DeckCopy {
    return new DeckCopy(data)
  }
}
