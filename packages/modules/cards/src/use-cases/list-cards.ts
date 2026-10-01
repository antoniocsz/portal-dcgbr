// Path: packages/modules/cards/src/use-cases/list-cards.ts
// Listagem pública do catálogo com filtros combinados (cor, tipo, custo, set)
// + busca full-text (nome/efeito) resolvida pelo repositório (Postgres).
import type { PaginatedResult } from '@digimon/contracts'
import type { Card } from '../domain/entities/card'
import type { CardRepository, ListCardsParams } from '../domain/repositories/card-repository'
import { listCardsSchema, type ListCardsInput } from './schemas'

export interface ListCardsCommand {
  input: ListCardsInput
}

export class ListCardsUseCase {
  constructor(private readonly repo: CardRepository) {}

  async execute(command: ListCardsCommand): Promise<PaginatedResult<Card>> {
    const parsed = listCardsSchema.parse(command.input)

    const params: ListCardsParams = {
      page: parsed.page ?? 1,
      pageSize: parsed.pageSize ?? 20
    }
    if (parsed.search) params.search = parsed.search
    if (parsed.type) params.type = parsed.type
    if (parsed.color) params.color = parsed.color
    if (parsed.playCost !== undefined) params.playCost = parsed.playCost
    if (parsed.setCode) params.setCode = parsed.setCode

    return this.repo.search(params)
  }
}
