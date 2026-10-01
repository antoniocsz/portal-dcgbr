// Path: packages/modules/cards/src/domain/repositories/card-repository.ts
// Interface do repositório de cartas — dependência invertida (DIP).
// Implementações: Prisma (infra) e in-memory (testes).
import type { PaginatedResult } from '@digimon/contracts'
import type { Card, CardColor, CardType } from '../entities/card'

export interface ListCardsParams {
  /** Termo de busca full-text (nome/efeito). */
  search?: string
  type?: CardType
  color?: CardColor
  playCost?: number
  setCode?: string
  page?: number
  pageSize?: number
}

export interface CardRepository {
  create(card: Card): Promise<void>
  update(card: Card): Promise<void>
  findById(id: string): Promise<Card | null>
  findByDcgId(dcgId: string): Promise<Card | null>
  findByNumber(number: string): Promise<Card | null>
  search(params: ListCardsParams): Promise<PaginatedResult<Card>>
}
