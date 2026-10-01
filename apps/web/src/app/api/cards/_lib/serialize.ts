// Path: apps/web/src/app/api/cards/_lib/serialize.ts
// Serialização das entidades do módulo para JSON (Dates → ISO strings).
import type { PaginatedResult } from '@digimon/contracts'
import type { Card, CardSet } from '@digimon/cards'

export interface CardDTO {
  id: string
  dcgId: string
  name: string
  number: string
  rarity: string
  type: string
  colors: string[]
  level: number | null
  digiType: string | null
  attribute: string | null
  dp: number | null
  playCost: number | null
  evolutionConditions: { color: string; level: number; cost: number }[]
  effects: string | null
  imageUrl: string | null
  setCode: string | null
  releaseDate: string | null
  updatedAt: string
}

export interface CardSetDTO {
  id: string
  code: string
  name: string
  releaseDate: string | null
}

export function serializeCard(card: Card): CardDTO {
  const d = card.data
  return {
    id: d.id,
    dcgId: d.dcgId,
    name: d.name,
    number: d.number,
    rarity: d.rarity,
    type: d.type,
    colors: d.colors,
    level: d.level,
    digiType: d.digiType,
    attribute: d.attribute,
    dp: d.dp,
    playCost: d.playCost,
    evolutionConditions: d.evolutionConditions,
    effects: d.effects,
    imageUrl: d.imageUrl,
    setCode: d.setCode,
    releaseDate: d.releaseDate?.toISOString() ?? null,
    updatedAt: d.updatedAt.toISOString()
  }
}

export function serializeCardSet(set: CardSet): CardSetDTO {
  return {
    id: set.id,
    code: set.code,
    name: set.name,
    releaseDate: set.data.releaseDate?.toISOString() ?? null
  }
}

export function serializeList(result: PaginatedResult<Card>): PaginatedResult<CardDTO> {
  return {
    items: result.items.map(serializeCard),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}
