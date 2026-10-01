// Path: packages/modules/cards/src/domain/repositories/card-set-repository.ts
// Interface do repositório de séries/expansões (DIP).
import type { CardSet } from '../entities/card-set'

export interface CardSetRepository {
  upsert(set: CardSet): Promise<void>
  findByCode(code: string): Promise<CardSet | null>
  list(): Promise<CardSet[]>
}
