// Path: packages/modules/cards/src/test/memory-card-repository.ts
// Repositórios em memória para testes unitários (L — substitutos intercambiáveis
// das implementações Prisma). Simulam o full-text por substring em nome/efeitos.
import type { PaginatedResult } from '@digimon/contracts'
import type { Card } from '../domain/entities/card'
import type { CardSet } from '../domain/entities/card-set'
import type { CardRepository, ListCardsParams } from '../domain/repositories/card-repository'
import type { CardSetRepository } from '../domain/repositories/card-set-repository'

export class MemoryCardRepository implements CardRepository {
  private readonly cards = new Map<string, Card>()
  private readonly byDcgId = new Map<string, string>()

  async create(card: Card): Promise<void> {
    this.cards.set(card.id, card)
    this.byDcgId.set(card.dcgId.toLowerCase(), card.id)
  }

  async update(card: Card): Promise<void> {
    this.cards.set(card.id, card)
    this.byDcgId.set(card.dcgId.toLowerCase(), card.id)
  }

  async findById(id: string): Promise<Card | null> {
    return this.cards.get(id) ?? null
  }

  async findByDcgId(dcgId: string): Promise<Card | null> {
    const id = this.byDcgId.get(dcgId.toLowerCase())
    return id ? this.cards.get(id) ?? null : null
  }

  async findByNumber(number: string): Promise<Card | null> {
    for (const card of this.cards.values()) {
      if (card.data.number === number) return card
    }
    return null
  }

  async search(params: ListCardsParams): Promise<PaginatedResult<Card>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
    const term = params.search?.trim().toLowerCase()

    const matching = [...this.cards.values()].filter((card) => {
      const d = card.data
      if (params.type && d.type !== params.type) return false
      if (params.color && !d.colors.includes(params.color)) return false
      if (params.playCost !== undefined && d.playCost !== params.playCost) return false
      if (params.setCode && d.setCode !== params.setCode) return false
      if (term) {
        const haystack = `${d.name} ${d.effects ?? ''}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })

    if (term) {
      matching.sort((a, b) => {
        const aName = a.data.name.toLowerCase().includes(term) ? 0 : 1
        const bName = b.data.name.toLowerCase().includes(term) ? 0 : 1
        return aName - bName
      })
    }

    return {
      items: matching.slice((page - 1) * pageSize, page * pageSize),
      total: matching.length,
      page,
      pageSize
    }
  }
}

export class MemoryCardSetRepository implements CardSetRepository {
  private readonly sets = new Map<string, CardSet>()

  async upsert(set: CardSet): Promise<void> {
    this.sets.set(set.code, set)
  }

  async findByCode(code: string): Promise<CardSet | null> {
    return this.sets.get(code.trim().toUpperCase()) ?? null
  }

  async list(): Promise<CardSet[]> {
    return [...this.sets.values()]
  }
}
