// Path: apps/api/src/routes/cards.ts
// Rotas de cards em Fastify — porte dos route handlers de
// apps/web/src/app/api/cards/** (strangler, ADR-007). Contratos JSON idênticos:
// listagem pública (filtros + busca full-text + paginação), ficha por
// id/dcgId/número, séries/expansões e importação/curadoria (administrator).
// Erros de domínio (AppError) são traduzidos pelo handler global.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { PaginatedResult } from '@digimon/contracts'
import { requireRole } from '@digimon/auth'
import { listCardsSchema } from '@digimon/cards'
import type { Card, CardActor, CardSet, ImportCardsInput } from '@digimon/cards'
import { cardsDeps } from '../container'
import { getAuthContext } from '../plugins/auth'

interface CardDTO {
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

interface CardSetDTO {
  id: string
  code: string
  name: string
  releaseDate: string | null
}

function serializeCard(card: Card): CardDTO {
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

function serializeCardSet(set: CardSet): CardSetDTO {
  return {
    id: set.id,
    code: set.code,
    name: set.name,
    releaseDate: set.data.releaseDate?.toISOString() ?? null
  }
}

function serializeList(result: PaginatedResult<Card>): PaginatedResult<CardDTO> {
  return {
    items: result.items.map(serializeCard),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

/** Query string → undefined quando ausente/vazia (mesma semântica do web). */
function queryString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return queryString(value[0])
  return String(value)
}

/** Sessão + papel administrator — porte de requireAdminUser do web. */
function requireAdminActor(request: FastifyRequest): CardActor {
  const context = getAuthContext(request)
  requireRole(context, 'administrator')
  return { id: context.userId, role: context.role }
}

const { list: listCards, get: getCard, listSets, import: importCards } = cardsDeps()

export const cardsRoutes: FastifyPluginAsync = async (app) => {
  // GET /cards — listagem pública (filtros + full-text + paginação).
  app.get<{ Querystring: Record<string, unknown> }>('/cards', async (request, reply) => {
    const { search, type, color, playCost, setCode, page, pageSize } = request.query
    const input = listCardsSchema.parse({
      search: queryString(search),
      type: queryString(type),
      color: queryString(color),
      playCost: queryString(playCost),
      setCode: queryString(setCode),
      page: queryString(page),
      pageSize: queryString(pageSize)
    })
    const result = await listCards.execute({ input })
    return reply.send(serializeList(result))
  })

  // GET /cards/sets — séries/expansões (leitura pública).
  app.get('/cards/sets', async (_request, reply) => {
    const sets = await listSets.execute()
    return reply.send({ items: sets.map(serializeCardSet) })
  })

  // GET /cards/:id — ficha pública; ?number= busca por número.
  app.get<{ Params: { id: string }; Querystring: Record<string, unknown> }>(
    '/cards/:id',
    async (request, reply) => {
      const number = queryString(request.query.number)
      const card = number
        ? await getCard.execute({ number })
        : await getCard.execute({ id: request.params.id })
      return reply.send(serializeCard(card))
    }
  )

  // POST /cards/admin/import — importação/curadoria (administrator).
  app.post<{ Body: ImportCardsInput }>('/cards/admin/import', async (request, reply) => {
    const actor = requireAdminActor(request)
    const result = await importCards.execute({ actor, input: request.body })
    return reply.status(201).send(result)
  })
}
