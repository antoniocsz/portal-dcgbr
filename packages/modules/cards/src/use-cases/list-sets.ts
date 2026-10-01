// Path: packages/modules/cards/src/use-cases/list-sets.ts
// Lista séries/expansões do catálogo. Leitura pública.
import type { CardSet } from '../domain/entities/card-set'
import type { CardSetRepository } from '../domain/repositories/card-set-repository'

export class ListSetsUseCase {
  constructor(private readonly repo: CardSetRepository) {}

  async execute(): Promise<CardSet[]> {
    return this.repo.list()
  }
}
