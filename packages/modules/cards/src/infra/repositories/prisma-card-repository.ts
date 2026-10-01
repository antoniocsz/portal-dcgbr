// Path: packages/modules/cards/src/infra/repositories/prisma-card-repository.ts
// Implementação Prisma de CardRepository. Mapeia enums do Prisma (UPPER_CASE)
// para as unions do domínio (lower-case). Busca full-text via to_tsvector/@@
// plainto_tsquery (ADR-003) — índice GIN "cards_search_idx" criado na migration.
import {
  PrismaClient,
  Prisma,
  CardType as PrismaCardType,
  CardColor as PrismaCardColor
} from '@digimon/database'
import type { PaginatedResult } from '@digimon/contracts'
import {
  Card,
  parseEvolutionConditions,
  type CardColor,
  type CardData,
  type CardType
} from '../../domain/entities/card'
import type { CardRepository, ListCardsParams } from '../../domain/repositories/card-repository'

const TYPE_TO_PRISMA: Record<CardType, PrismaCardType> = {
  digimon: 'DIGIMON',
  option: 'OPTION',
  tamer: 'TAMER'
}

const TYPE_FROM_PRISMA: Record<PrismaCardType, CardType> = {
  DIGIMON: 'digimon',
  OPTION: 'option',
  TAMER: 'tamer'
}

const COLOR_TO_PRISMA: Record<CardColor, PrismaCardColor> = {
  red: 'RED',
  blue: 'BLUE',
  yellow: 'YELLOW',
  green: 'GREEN',
  purple: 'PURPLE',
  black: 'BLACK',
  white: 'WHITE'
}

const COLOR_FROM_PRISMA: Record<PrismaCardColor, CardColor> = {
  RED: 'red',
  BLUE: 'blue',
  YELLOW: 'yellow',
  GREEN: 'green',
  PURPLE: 'purple',
  BLACK: 'black',
  WHITE: 'white'
}

type CardRow = Prisma.CardGetPayload<object>

function mapToDomain(row: CardRow): Card {
  const data: CardData = {
    id: row.id,
    dcgId: row.dcgId,
    name: row.name,
    number: row.number,
    rarity: row.rarity,
    type: TYPE_FROM_PRISMA[row.type],
    colors: row.colors.map((color) => COLOR_FROM_PRISMA[color]),
    level: row.level,
    digiType: row.digiType,
    attribute: row.attribute,
    dp: row.dp,
    playCost: row.playCost,
    evolutionConditions: parseEvolutionConditions(row.evolutionConditions),
    effects: row.effects,
    imageUrl: row.imageUrl,
    setCode: row.setCode,
    releaseDate: row.releaseDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
  return Card.fromData(data)
}

export class PrismaCardRepository implements CardRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(card: Card): Promise<void> {
    await this.db.card.create({ data: this.toPersistence(card) })
  }

  async update(card: Card): Promise<void> {
    const d = card.data
    await this.db.card.update({
      where: { id: d.id },
      data: {
        dcgId: d.dcgId,
        name: d.name,
        number: d.number,
        rarity: d.rarity,
        type: TYPE_TO_PRISMA[d.type],
        colors: d.colors.map((color) => COLOR_TO_PRISMA[color]),
        level: d.level,
        digiType: d.digiType,
        attribute: d.attribute,
        dp: d.dp,
        playCost: d.playCost,
        evolutionConditions: d.evolutionConditions as unknown as Prisma.InputJsonValue,
        effects: d.effects,
        imageUrl: d.imageUrl,
        setCode: d.setCode,
        releaseDate: d.releaseDate,
        updatedAt: d.updatedAt
      }
    })
  }

  async findById(id: string): Promise<Card | null> {
    const row = await this.db.card.findUnique({ where: { id } })
    return row ? mapToDomain(row) : null
  }

  async findByDcgId(dcgId: string): Promise<Card | null> {
    const row = await this.db.card.findUnique({ where: { dcgId } })
    return row ? mapToDomain(row) : null
  }

  async findByNumber(number: string): Promise<Card | null> {
    const row = await this.db.card.findFirst({ where: { number } })
    return row ? mapToDomain(row) : null
  }

  async search(params: ListCardsParams): Promise<PaginatedResult<Card>> {
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20))
    const where: Prisma.CardWhereInput = {}
    if (params.type) where.type = TYPE_TO_PRISMA[params.type]
    if (params.color) where.colors = { has: COLOR_TO_PRISMA[params.color] }
    if (params.playCost !== undefined) where.playCost = params.playCost
    if (params.setCode) where.setCode = params.setCode

    const search = params.search?.trim()
    if (!search) {
      const [rows, total] = await Promise.all([
        this.db.card.findMany({
          where,
          orderBy: { number: 'asc' },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        this.db.card.count({ where })
      ])
      return { items: rows.map(mapToDomain), total, page, pageSize }
    }

    const matches = await this.db.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "cards"
      WHERE to_tsvector('simple', "name" || ' ' || coalesce("effects", ''))
        @@ plainto_tsquery('simple', ${search})
      ORDER BY ts_rank(
        to_tsvector('simple', "name" || ' ' || coalesce("effects", '')),
        plainto_tsquery('simple', ${search})
      ) DESC
      LIMIT 1000
    `
    const ids = matches.map((match) => match.id)
    if (ids.length === 0) return { items: [], total: 0, page, pageSize }

    const rows = await this.db.card.findMany({ where: { ...where, id: { in: ids } } })
    const rank = new Map(ids.map((id, index) => [id, index]))
    const ordered = rows
      .map(mapToDomain)
      .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))

    return {
      items: ordered.slice((page - 1) * pageSize, page * pageSize),
      total: ordered.length,
      page,
      pageSize
    }
  }

  private toPersistence(card: Card): Prisma.CardUncheckedCreateInput {
    const d = card.data
    return {
      id: d.id,
      dcgId: d.dcgId,
      name: d.name,
      number: d.number,
      rarity: d.rarity,
      type: TYPE_TO_PRISMA[d.type],
      colors: d.colors.map((color) => COLOR_TO_PRISMA[color]),
      level: d.level,
      digiType: d.digiType,
      attribute: d.attribute,
      dp: d.dp,
      playCost: d.playCost,
      evolutionConditions: d.evolutionConditions as unknown as Prisma.InputJsonValue,
      effects: d.effects,
      imageUrl: d.imageUrl,
      setCode: d.setCode,
      releaseDate: d.releaseDate,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }
  }
}
