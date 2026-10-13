// Path: packages/modules/decks/src/domain/repositories/public-deck-repository.ts
// Interface (DIP) do repositório de publicações da comunidade. Implementações:
// Prisma (infra) e in-memory (testes). Contadores são mutados atomicamente
// pelos métodos dedicados (like/unlike/addCopy), nunca via `update` da entidade
// — preservando `updatedAt` como "último congelamento de conteúdo".
import type { PublicDeck, PublicDeckData } from '../entities/public-deck'
import type {
  CommunityDeckStatus,
  CommunitySort
} from '../community/community-types'

/** Publicação + dados de leitura derivados do join com o autor. */
export interface PublicDeckRecord {
  deck: PublicDeck
  ownerName: string
  likedByMe: boolean
}

/** Publicação do autor + `updatedAt` do deck de origem (para `outdated`). */
export interface PublicationRecord {
  deck: PublicDeck
  sourceUpdatedAt: Date
}

export interface ListPublicDecksQuery {
  status: CommunityDeckStatus
  colors?: string[]
  search?: string
  sort: CommunitySort
  /** Início da janela de curtidas recentes (só para `sort=top` com período). */
  since?: Date
  viewerId?: string | null
  page: number
  pageSize: number
}

/** Página do feed: sem COUNT total — busca `pageSize + 1` para `hasMore`. */
export interface PublicDeckPage {
  items: PublicDeckRecord[]
  hasMore: boolean
}

export interface LikeResult {
  created: boolean
  likeCount: number
}

export interface UnlikeResult {
  removed: boolean
  likeCount: number
}

export interface CopyResult {
  created: boolean
  copyCount: number
}

export interface PublicDeckRepository {
  create(data: PublicDeckData): Promise<void>
  update(deck: PublicDeck): Promise<void>
  findBySourceDeck(accountId: string, sourceDeckId: string): Promise<PublicDeck | null>
  findById(id: string, viewerId?: string | null): Promise<PublicDeckRecord | null>
  list(query: ListPublicDecksQuery): Promise<PublicDeckPage>
  publications(ownerId: string): Promise<PublicationRecord[]>
  unpublish(id: string): Promise<void>
  like(publicDeckId: string, accountId: string): Promise<LikeResult>
  unlike(publicDeckId: string, accountId: string): Promise<UnlikeResult>
  addCopy(publicDeckId: string, accountId: string): Promise<CopyResult>
}
