// Path: apps/api/src/routes/decks.ts
// Rotas de decks em Fastify — porte dos route handlers de
// apps/web/src/app/api/decks/** e apps/web/src/app/api/admin/decks/** (strangler,
// ADR-007). Contratos JSON e erros idênticos; caminhos completos /decks e
// /admin/decks (o registro de rotas não usa prefixo). Erros via AppError são
// traduzidos pelo handler global.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { PaginatedResult } from '@digimon/contracts'
import { UnauthorizedError } from '@digimon/contracts'
import { listDecksSchema } from '@digimon/decks'
import type {
  Actor,
  CreateDeckInput,
  Deck,
  DeckCardEntry,
  UpdateDeckInput
} from '@digimon/decks'
import { decksDeps } from '../container'
import { authenticate, getAuthContext, requireRoleHook } from '../plugins/auth'

// --- Composição (DIP): factories centralizadas no container -----------------
const decks = decksDeps()

// --- Sessão (porte de api/decks/_lib/session.ts) ----------------------------
/** Ator autenticado (requireUser): 401 via AppError se ausente/inválido. */
function actorFrom(request: FastifyRequest): Actor {
  const context = request.auth ?? getAuthContext(request)
  return { id: context.userId, role: context.role }
}

/** Ator opcional (getSessionUser): null se não autenticado, mantém outros erros. */
function optionalActor(request: FastifyRequest): Actor | null {
  try {
    return actorFrom(request)
  } catch (error) {
    if (error instanceof UnauthorizedError) return null
    throw error
  }
}

// --- Serialização (porte de api/decks/_lib/serialize.ts) --------------------
interface DeckDTO {
  id: string
  slug: string
  name: string
  ownerId: string
  description: string | null
  cardList: DeckCardEntry[]
  format: string
  status: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface DeckSummaryDTO {
  id: string
  slug: string
  name: string
  ownerId: string
  format: string
  status: string
  isPublic: boolean
  cardCount: number
}

function serializeDeck(deck: Deck): DeckDTO {
  const d = deck.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    ownerId: d.ownerId,
    description: d.description,
    cardList: d.cardList,
    format: d.format,
    status: d.status,
    isPublic: d.isPublic,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializeSummary(deck: Deck): DeckSummaryDTO {
  const d = deck.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    ownerId: d.ownerId,
    format: d.format,
    status: d.status,
    isPublic: d.isPublic,
    cardCount: d.cardList.reduce((sum, entry) => sum + entry.quantity, 0)
  }
}

function serializeList(result: PaginatedResult<Deck>): PaginatedResult<DeckSummaryDTO> {
  return {
    items: result.items.map(serializeSummary),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

// --- Query params (porte de api/decks/_lib/handlers.ts) ---------------------
interface DecksQuery {
  mine?: string
  search?: string
  format?: string
  status?: string
  page?: string
  pageSize?: string
}

function queryString(value: string | undefined): string | undefined {
  return value === undefined || value === '' ? undefined : value
}

function parseListInput(query: DecksQuery) {
  return listDecksSchema.parse({
    search: queryString(query.search),
    format: queryString(query.format),
    status: queryString(query.status),
    page: queryString(query.page),
    pageSize: queryString(query.pageSize)
  })
}

export const decksRoutes: FastifyPluginAsync = async (app) => {
  // GET /decks — listagem pública; ?mine=true lista os decks do próprio usuário.
  app.get<{ Querystring: DecksQuery }>('/decks', async (request, reply) => {
    const input = parseListInput(request.query)

    if (request.query.mine === 'true') {
      const actor = actorFrom(request)
      const result = await decks.list.execute({ input, actor, mine: true })
      return reply.send(serializeList(result))
    }

    const actor = optionalActor(request)
    const result = await decks.list.execute({ input, actor })
    return reply.send(serializeList(result))
  })

  // POST /decks — cria deck (autenticado; draft ou published direto).
  app.post<{ Body: CreateDeckInput }>(
    '/decks',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await decks.create.execute({
        actor: actorFrom(request),
        input: request.body
      })
      return reply.status(201).send(result)
    }
  )

  // GET /decks/:slug — detalhe (rascunho/unlisted só dono — 404 sem vazar).
  app.get<{ Params: { slug: string } }>('/decks/:slug', async (request, reply) => {
    const deck = await decks.get.execute({
      slug: request.params.slug,
      actor: optionalActor(request)
    })
    return reply.send(serializeDeck(deck))
  })

  // PATCH /decks/:slug — edita (somente dono).
  app.patch<{ Params: { slug: string }; Body: UpdateDeckInput }>(
    '/decks/:slug',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await decks.update.execute({
        actor: actorFrom(request),
        slug: request.params.slug,
        input: request.body
      })
      return reply.send(result)
    }
  )

  // DELETE /decks/:slug — remove (somente dono).
  app.delete<{ Params: { slug: string } }>(
    '/decks/:slug',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await decks.remove.execute({
        actor: actorFrom(request),
        slug: request.params.slug
      })
      return reply.send(result)
    }
  )

  // POST /decks/:slug/publish — publica direto (somente dono).
  app.post<{ Params: { slug: string } }>(
    '/decks/:slug/publish',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await decks.publish.execute({
        actor: actorFrom(request),
        slug: request.params.slug
      })
      return reply.send(result)
    }
  )

  // POST /decks/:slug/copy — copia deck alheio → novo deck próprio (201).
  app.post<{ Params: { slug: string } }>(
    '/decks/:slug/copy',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await decks.copy.execute({
        actor: actorFrom(request),
        slug: request.params.slug
      })
      return reply.status(201).send(result)
    }
  )

  // GET /admin/decks — gestão admin (administrator|editor); agenda completa.
  app.get<{ Querystring: DecksQuery }>(
    '/admin/decks',
    { preHandler: [authenticate, requireRoleHook(['administrator', 'editor'])] },
    async (request, reply) => {
      const input = parseListInput(request.query)
      const result = await decks.list.execute({ input, actor: actorFrom(request) })
      return reply.send(serializeList(result))
    }
  )

  // DELETE /admin/decks/:slug — exclui qualquer deck (somente administrator).
  app.delete<{ Params: { slug: string } }>(
    '/admin/decks/:slug',
    { preHandler: [authenticate, requireRoleHook('administrator')] },
    async (request, reply) => {
      const result = await decks.remove.execute({
        actor: actorFrom(request),
        slug: request.params.slug
      })
      return reply.send(result)
    }
  )
}
