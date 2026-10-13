// Path: packages/modules/cards/src/test/memory-card-repository.ts
// Repositórios em memória para testes unitários (L — substitutos intercambiáveis
// das implementações Prisma). Simulam o full-text por substring em nome/efeitos
// e o match por código da carta (`number`) / da coleção (`setCode`) normalizado —
// paridade com a semântica e a ordem de prioridade do `PrismaCardRepository`.
import type { PaginatedResult } from '@digimon/contracts'
import type { Card } from '../domain/entities/card'
import type { CardSet } from '../domain/entities/card-set'
import type { CardRepository, ListCardsParams } from '../domain/repositories/card-repository'
import type { CardSetRepository } from '../domain/repositories/card-set-repository'

// Normalização de código idêntica à do `PrismaCardRepository` (minúsculas, sem
// hífen/espaço): "BT1-001" ≡ "BT1 001" ≡ "bt1001". Mantenha as duas em sincronia.
const CODE_SEPARATORS = /[\s-]+/g

function normalizeCode(value: string): string {
  return value.toLowerCase().replace(CODE_SEPARATORS, '')
}

// Prioridade equivalente ao CASE do `PrismaCardRepository.search`:
// número exato (0) > número por prefixo (1) > setCode exato (2) >
// setCode por prefixo (3) > apenas textual (4).
function codePriority(card: Card, normalized: string): number {
  if (normalized === '') return 4
  const number = normalizeCode(card.data.number)
  if (number === normalized) return 0
  if (number.startsWith(normalized)) return 1
  const setCode = card.data.setCode ? normalizeCode(card.data.setCode) : ''
  if (setCode === normalized) return 2
  if (setCode.startsWith(normalized)) return 3
  return 4
}

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
    const search = params.search?.trim()
    const term = search?.toLowerCase()
    const normalized = search ? normalizeCode(search) : ''

    const matching = [...this.cards.values()].filter((card) => {
      const d = card.data
      if (params.type && d.type !== params.type) return false
      if (params.color && !d.colors.includes(params.color)) return false
      if (params.playCost !== undefined && d.playCost !== params.playCost) return false
      if (
        params.minPlayCost !== undefined &&
        (d.playCost === null || d.playCost < params.minPlayCost)
      )
        return false
      if (
        params.maxPlayCost !== undefined &&
        (d.playCost === null || d.playCost > params.maxPlayCost)
      )
        return false
      if (params.setCode && d.setCode !== params.setCode) return false
      if (term) {
        const haystack = `${d.name} ${d.effects ?? ''}`.toLowerCase()
        const textMatch = haystack.includes(term)
        const codeMatch =
          normalized !== '' &&
          (normalizeCode(d.number).startsWith(normalized) ||
            (d.setCode !== null && normalizeCode(d.setCode).startsWith(normalized)))
        if (!textMatch && !codeMatch) return false
      }
      return true
    })

    if (term) {
      matching.sort((a, b) => {
        const priority = codePriority(a, normalized) - codePriority(b, normalized)
        if (priority !== 0) return priority
        const aName = a.data.name.toLowerCase().includes(term) ? 0 : 1
        const bName = b.data.name.toLowerCase().includes(term) ? 0 : 1
        if (aName !== bName) return aName - bName
        return a.data.number < b.data.number ? -1 : a.data.number > b.data.number ? 1 : 0
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
