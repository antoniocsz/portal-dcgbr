// Path: packages/modules/decks/src/domain/entities/public-deck.ts
// Snapshot CONGELADO de um deck publicado na comunidade. Não acompanha edições
// do deck de origem (sourceDeckId) — o autor re-publica para atualizar. Guarda
// o engajamento (likes/cópias) e o status de moderação.
import { randomUUID } from 'node:crypto'
import { ValidationError } from '@digimon/contracts'
import type { Deck, DeckCardEntry } from './deck'
import type { CommunityDeckStatus } from '../community/community-types'

export interface PublicDeckData {
  id: string
  accountId: string
  sourceDeckId: string
  name: string
  colors: string[]
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
  coverCardId: string | null
  likeCount: number
  copyCount: number
  status: CommunityDeckStatus
  publishedAt: Date
  updatedAt: Date
}

export interface RefreshSnapshotPatch {
  name: string
  colors: string[]
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
  coverCardId: string | null
}

function cloneEntries(entries: DeckCardEntry[]): DeckCardEntry[] {
  return entries.map((entry) => ({ cardId: entry.cardId, quantity: entry.quantity }))
}

export class PublicDeck {
  private constructor(public readonly data: PublicDeckData) {}

  /**
   * Congela um deck legal como publicação da comunidade. `legal` é invariante
   * (defense in depth — o use case já validou antes de chamar). `colors` são as
   * cores dominantes; `name` (opcional) é o nome já revisado pela moderação.
   */
  static fromSource(
    deck: Deck,
    ownerId: string,
    extras: { name?: string; colors: string[]; legal: boolean }
  ): PublicDeck {
    if (!extras.legal) {
      throw new ValidationError('Deck ilegal não pode ser publicado na comunidade')
    }
    const now = new Date()
    return new PublicDeck({
      id: randomUUID(),
      accountId: ownerId,
      sourceDeckId: deck.id,
      name: extras.name ?? deck.data.name,
      colors: [...extras.colors],
      cardList: cloneEntries(deck.data.cardList),
      eggList: cloneEntries(deck.data.eggList),
      coverCardId: deck.data.coverCardId,
      likeCount: 0,
      copyCount: 0,
      status: 'public',
      publishedAt: now,
      updatedAt: now
    })
  }

  static fromData(data: PublicDeckData): PublicDeck {
    return new PublicDeck(data)
  }

  get id(): string {
    return this.data.id
  }

  get accountId(): string {
    return this.data.accountId
  }

  get sourceDeckId(): string {
    return this.data.sourceDeckId
  }

  get status(): CommunityDeckStatus {
    return this.data.status
  }

  get updatedAt(): Date {
    return this.data.updatedAt
  }

  /** Desatualizado se o deck de origem mudou depois do último congelamento. */
  isOutdated(savedUpdatedAt: Date): boolean {
    return savedUpdatedAt.getTime() > this.data.updatedAt.getTime()
  }

  /** Re-congela o snapshot (re-publicação); volta ao feed e preserva engajamento. */
  refresh(patch: RefreshSnapshotPatch): void {
    this.data.name = patch.name
    this.data.colors = [...patch.colors]
    this.data.cardList = cloneEntries(patch.cardList)
    this.data.eggList = cloneEntries(patch.eggList)
    this.data.coverCardId = patch.coverCardId
    this.data.status = 'public'
    this.data.updatedAt = new Date()
  }
}
