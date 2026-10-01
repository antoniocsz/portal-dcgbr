// Path: packages/modules/decks/src/domain/entities/deck.ts
// Aggregate raiz do módulo decks (deckbuilder). Colaborativo: Member publica
// decks próprios direto (status inicial `published` opcional, sem revisão).
// Regras: rascunhos visíveis só ao dono; publicados+isPublic são públicos.
import { ValidationError } from '@digimon/contracts'

export type DeckStatus = 'draft' | 'published'

export interface DeckCardEntry {
  cardId: string
  quantity: number
}

export interface DeckData {
  id: string
  slug: string
  name: string
  ownerId: string
  description: string | null
  cardList: DeckCardEntry[]
  format: string
  status: DeckStatus
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateDeckData {
  id: string
  slug: string
  name: string
  ownerId: string
  description: string | null
  cardList: DeckCardEntry[]
  format: string
  status: DeckStatus
  isPublic: boolean
}

export interface UpdateDeckData {
  slug?: string
  name?: string
  description?: string | null
  cardList?: DeckCardEntry[]
  format?: string
  isPublic?: boolean
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function assertValidCardList(cardList: DeckCardEntry[]): void {
  for (const entry of cardList) {
    if (entry.cardId.trim() === '') {
      throw new ValidationError('cardList contém uma carta sem cardId')
    }
    if (!Number.isInteger(entry.quantity) || entry.quantity < 1) {
      throw new ValidationError(`Quantidade inválida para a carta "${entry.cardId}"`)
    }
  }
}

export class Deck {
  private constructor(public readonly data: DeckData) {}

  static create(props: CreateDeckData): Deck {
    assertValidCardList(props.cardList)
    const now = new Date()
    return new Deck({
      ...props,
      description: props.description ?? null,
      createdAt: now,
      updatedAt: now
    })
  }

  static fromData(data: DeckData): Deck {
    return new Deck(data)
  }

  get id(): string {
    return this.data.id
  }

  get slug(): string {
    return this.data.slug
  }

  get status(): DeckStatus {
    return this.data.status
  }

  get ownerId(): string {
    return this.data.ownerId
  }

  /** Visível publicamente: publicado E isPublic (unlisted não aparece). */
  get isPublicViewable(): boolean {
    return this.data.status === 'published' && this.data.isPublic
  }

  /** Edita dados do deck. cardList deve conter ao menos uma carta ao publicar. */
  update(patch: UpdateDeckData): void {
    if (patch.cardList !== undefined) assertValidCardList(patch.cardList)
    if (patch.slug !== undefined) this.data.slug = patch.slug
    if (patch.name !== undefined) this.data.name = patch.name
    if (patch.description !== undefined) this.data.description = patch.description
    if (patch.cardList !== undefined) this.data.cardList = patch.cardList
    if (patch.format !== undefined) this.data.format = patch.format
    if (patch.isPublic !== undefined) this.data.isPublic = patch.isPublic
    this.data.updatedAt = new Date()
  }

  /** Publica direto (sem revisão). Publicar exige ao menos uma carta no cardList. */
  publish(): void {
    if (this.data.status === 'published') return
    if (this.data.cardList.length === 0) {
      throw new ValidationError('Deck precisa ter ao menos uma carta para ser publicado')
    }
    this.data.status = 'published'
    this.data.isPublic = true
    this.data.updatedAt = new Date()
  }
}
