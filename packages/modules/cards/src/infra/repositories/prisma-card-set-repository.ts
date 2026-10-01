// Path: packages/modules/cards/src/infra/repositories/prisma-card-set-repository.ts
// Implementação Prisma de CardSetRepository (séries/expansões).
import { PrismaClient } from '@digimon/database'
import { CardSet, type CardSetData } from '../../domain/entities/card-set'
import type { CardSetRepository } from '../../domain/repositories/card-set-repository'

function mapToDomain(row: {
  id: string
  code: string
  name: string
  releaseDate: Date | null
  createdAt: Date
  updatedAt: Date
}): CardSet {
  const data: CardSetData = {
    id: row.id,
    code: row.code,
    name: row.name,
    releaseDate: row.releaseDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return CardSet.fromData(data)
}

export class PrismaCardSetRepository implements CardSetRepository {
  constructor(private readonly db: PrismaClient) {}

  async upsert(set: CardSet): Promise<void> {
    const d = set.data
    await this.db.cardSet.upsert({
      where: { code: d.code },
      create: {
        id: d.id,
        code: d.code,
        name: d.name,
        releaseDate: d.releaseDate,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt
      },
      update: {
        name: d.name,
        releaseDate: d.releaseDate,
        updatedAt: d.updatedAt
      }
    })
  }

  async findByCode(code: string): Promise<CardSet | null> {
    const row = await this.db.cardSet.findUnique({ where: { code: code.trim().toUpperCase() } })
    return row ? mapToDomain(row) : null
  }

  async list(): Promise<CardSet[]> {
    const rows = await this.db.cardSet.findMany({ orderBy: { releaseDate: 'desc' } })
    return rows.map(mapToDomain)
  }
}
