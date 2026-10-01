// Path: packages/modules/decks/src/domain/repositories/deck-repository.ts
// Interface do repositório de decks — implementações: Prisma (infra) e
// in-memory (testes). Não multi-tenant (ADR-004): sem tenantId nas queries.
import type { PaginatedResult } from '@digimon/contracts'
import type { Deck, DeckData, DeckStatus } from '../entities/deck'
import type { DeckCopyData } from '../entities/deck-copy'

export interface ListDecksParams {
  status?: DeckStatus
  format?: string
  ownerId?: string
  /** Busca full-text no nome (ADR-003 — índice GIN decks_search_idx). */
  search?: string
  /** Se true, lista apenas decks publicados e isPublic (listagem pública). */
  publicOnly?: boolean
  page?: number
  pageSize?: number
}

export interface DeckRepository {
  create(data: DeckData): Promise<void>
  update(deck: Deck): Promise<void>
  delete(id: string): Promise<void>
  findById(id: string): Promise<Deck | null>
  findBySlug(slug: string): Promise<Deck | null>
  list(params: ListDecksParams): Promise<PaginatedResult<Deck>>
  createCopy(data: DeckCopyData): Promise<void>
}
