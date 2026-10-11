// Path: apps/api/src/routes/tournaments.ts
// Rotas de torneios em Fastify — porte dos route handlers de
// apps/web/src/app/api/tournaments/** (strangler, ADR-007). Contratos JSON
// idênticos; erros via AppError (handler global da API).
// Rotas: GET/POST /tournaments, GET/PATCH/DELETE /tournaments/:slug,
// POST /tournaments/:slug/results.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { UnauthorizedError } from '@digimon/contracts'
import type { PaginatedResult } from '@digimon/contracts'
import {
  listTournamentsSchema,
  type AddResultsInput,
  type Actor,
  type CreateTournamentInput,
  type ListTournamentsInput,
  type Tournament,
  type TournamentResultEntry,
  type UpdateTournamentInput
} from '@digimon/tournaments'
import { tournamentsDeps } from '../container'
import { getAuthContext } from '../plugins/auth'

// Composição (DIP): factories centralizadas no container.
const tournaments = tournamentsDeps()

interface TournamentDTO {
  id: string
  slug: string
  name: string
  organizerId: string
  description: string | null
  format: string
  location: string
  dateStart: string
  dateEnd: string | null
  status: string
  results: TournamentResultEntry[] | null
  createdAt: string
  updatedAt: string
}

interface TournamentSummaryDTO {
  id: string
  slug: string
  name: string
  format: string
  location: string
  dateStart: string
  status: string
  organizerId: string
}

function serializeTournament(tournament: Tournament): TournamentDTO {
  const d = tournament.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    organizerId: d.organizerId,
    description: d.description,
    format: d.format,
    location: d.location,
    dateStart: d.dateStart.toISOString(),
    dateEnd: d.dateEnd?.toISOString() ?? null,
    status: d.status,
    results: d.results,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializeSummary(tournament: Tournament): TournamentSummaryDTO {
  const d = tournament.data
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    format: d.format,
    location: d.location,
    dateStart: d.dateStart.toISOString(),
    status: d.status,
    organizerId: d.organizerId
  }
}

function serializeList(
  result: PaginatedResult<Tournament>
): PaginatedResult<TournamentSummaryDTO> {
  return {
    items: result.items.map(serializeSummary),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

function queryString(value: string | undefined): string | undefined {
  return value === undefined || value === '' ? undefined : value
}

function requireActor(request: FastifyRequest): Actor {
  const context = getAuthContext(request)
  return { id: context.userId, role: context.role }
}

function optionalActor(request: FastifyRequest): Actor | null {
  try {
    return requireActor(request)
  } catch (error) {
    if (error instanceof UnauthorizedError) return null
    throw error
  }
}

export const tournamentsRoutes: FastifyPluginAsync = async (app) => {
  // GET /tournaments — agenda pública (somente published; Admin/Editor filtram por
  // status). ?mine=true lista os torneios do próprio Member (qualquer status).
  app.get('/tournaments', async (request, reply) => {
    const query = request.query as Record<string, string | undefined>
    const input: ListTournamentsInput = listTournamentsSchema.parse({
      format: queryString(query.format),
      location: queryString(query.location),
      status: queryString(query.status),
      from: queryString(query.from),
      page: queryString(query.page),
      pageSize: queryString(query.pageSize)
    })

    if (query.mine === 'true') {
      const actor = requireActor(request)
      const result = await tournaments.list.execute({ input, actor, mine: true })
      return reply.send(serializeList(result))
    }

    const actor = optionalActor(request)
    const result = await tournaments.list.execute({ input, actor })
    return reply.send(serializeList(result))
  })

  // POST /tournaments — Member autenticado publica torneio direto (colaborativo).
  app.post('/tournaments', async (request, reply) => {
    const actor = requireActor(request)
    const input = request.body as CreateTournamentInput
    const result = await tournaments.create.execute({ actor, input })
    return reply.status(201).send(result)
  })

  // GET /tournaments/:slug — detalhe público (cancelado só criador/Admin/Editor;
  // NotFound sem vazar existência).
  app.get('/tournaments/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const actor = optionalActor(request)
    const tournament = await tournaments.get.execute({ slug, actor })
    return reply.send(serializeTournament(tournament))
  })

  // PATCH /tournaments/:slug — edita (criador OU Admin/Editor).
  app.patch('/tournaments/:slug', async (request, reply) => {
    const actor = requireActor(request)
    const { slug } = request.params as { slug: string }
    const input = request.body as UpdateTournamentInput
    const result = await tournaments.update.execute({ actor, slug, input })
    return reply.send(result)
  })

  // DELETE /tournaments/:slug — cancela (criador OU Admin/Editor).
  app.delete('/tournaments/:slug', async (request, reply) => {
    const actor = requireActor(request)
    const { slug } = request.params as { slug: string }
    const result = await tournaments.cancel.execute({ actor, slug })
    return reply.send(result)
  })

  // POST /tournaments/:slug/results — registra resultados e finaliza o torneio.
  app.post('/tournaments/:slug/results', async (request, reply) => {
    const actor = requireActor(request)
    const { slug } = request.params as { slug: string }
    const input = request.body as AddResultsInput
    const result = await tournaments.addResults.execute({ actor, slug, input })
    return reply.send(result)
  })
}
