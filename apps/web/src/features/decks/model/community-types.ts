// Path: apps/web/src/features/decks/model/community-types.ts
// Tipos da comunidade de decks (espelho dos DTOs das rotas /decks/community*).
// Decisão do projeto: o frontend não importa @digimon/decks no client (evita
// arrastar @digimon/database para o bundle) — tipos literais em sync com o backend.
import type { DeckCardEntry } from './types'

/** Status do snapshot no feed: público, oculto pela moderação ou despublicado. */
export type CommunityDeckStatus = 'public' | 'hidden' | 'unpublished'

/** Ordenação do feed: mais curtidos (`top`) ou mais recentes (`new`). */
export type CommunitySort = 'top' | 'new'

/** Janela de tempo do ranking `top` (curtidas recentes). */
export type CommunityPeriod = 'week' | 'month' | 'all'

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
  publishedAt: string
  updatedAt: string
}

/** Detalhe público de uma publicação (inclui a composição congelada). */
export interface CommunityDeck extends CommunityDeckSummary {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
}

/** Feed paginado por página (sem COUNT total). Contrato: `{ decks, hasMore }`. */
export interface CommunityDeckPage {
  decks: CommunityDeckSummary[]
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

export interface CommunityLikeResult {
  likeCount: number
  liked: boolean
}

export interface CommunityPublishResult {
  id: string
  sourceDeckId: string
  status: CommunityDeckStatus
}

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

/** Resultado do parse de uma decklist colada (POST /decks/import). */
export interface DeckListParseResult {
  cardList: DeckCardEntry[]
  eggList: DeckCardEntry[]
  skipped: string[]
  trimmed: DeckCardEntry[]
}

export interface ListCommunityDecksParams {
  sort?: CommunitySort
  period?: CommunityPeriod
  colors?: string[]
  search?: string
  page?: number
  pageSize?: number
}

export interface ReportCommunityDeckInput {
  reason: CommunityReportReason
  details?: string | null
}

export const COMMUNITY_SORT_LABELS: Record<CommunitySort, string> = {
  top: 'Mais curtidos',
  new: 'Recentes'
}

export const COMMUNITY_PERIOD_LABELS: Record<CommunityPeriod, string> = {
  week: 'Semana',
  month: 'Mês',
  all: 'Sempre'
}

export const COMMUNITY_STATUS_LABELS: Record<CommunityDeckStatus, string> = {
  public: 'Público',
  hidden: 'Oculto',
  unpublished: 'Despublicado'
}

/** Cores aceitas no filtro do feed (subset dos atributos Digimon). */
export const COMMUNITY_COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'black'] as const
