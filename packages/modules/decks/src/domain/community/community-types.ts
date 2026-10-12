// Path: packages/modules/decks/src/domain/community/community-types.ts
// Contrato de domínio da comunidade de decks: snapshot congelado (PublicDeck),
// engajamento (likes/cópias), feed e moderação (reportes). Sem infra.
import type { DeckCardEntry } from '../entities/deck'

/** Status do snapshot no feed: público, oculto pela moderação ou despublicado. */
export type CommunityDeckStatus = 'public' | 'hidden' | 'unpublished'

/** Ordenação do feed: mais curtidos (`top`) ou mais recentes (`new`). */
export type CommunitySort = 'top' | 'new'

/** Janela de tempo do ranking `top` (curtidas recentes). */
export type CommunityPeriod = 'week' | 'month' | 'all'

/** Ação de moderação sobre uma publicação. */
export type CommunityModerationAction = 'hide' | 'restore'

/** Motivos aceitos num reporte de deck da comunidade. */
export type CommunityReportReason = 'inappropriate' | 'spam' | 'copyright' | 'other'

/** Item do feed (sem a lista de cartas — payload enxuto). */
export interface CommunityDeckSummary {
  id: string
  name: string
  ownerId: string
  ownerName: string
  colors: string[]
  coverCardId: string | null
  likeCount: number
  copyCount: number
  likedByMe: boolean
  legal: boolean
  status: CommunityDeckStatus
  publishedAt: Date
  updatedAt: Date
}

/** Detalhe público de uma publicação (inclui a composição congelada). */
export interface CommunityDeck extends CommunityDeckSummary {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
}

/** Página do feed — sem COUNT total (paginação por página). */
export interface CommunityDeckPage {
  items: CommunityDeckSummary[]
  page: number
  pageSize: number
  hasMore: boolean
}

/** Publicação vista pelo próprio autor (minhas publicações). */
export interface CommunityPublication {
  id: string
  sourceDeckId: string
  name: string
  likeCount: number
  outdated: boolean
  status: CommunityDeckStatus
}

/** Reporte individual aberto contra uma publicação. */
export interface CommunityDeckReport {
  id: string
  publicDeckId: string
  reporterAccountId: string | null
  reason: string
  details: string | null
  createdAt: Date
  dismissedAt: Date | null
}

/** Agrupamento da fila de moderação (reportes abertos por publicação). */
export interface ReportedCommunityDeck {
  publicDeckId: string
  name: string
  ownerId: string
  ownerName: string
  status: CommunityDeckStatus
  likeCount: number
  reportCount: number
  lastReportedAt: Date
}
