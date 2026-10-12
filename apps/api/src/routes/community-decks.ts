// Path: apps/api/src/routes/community-decks.ts
// Rotas da comunidade de decks em Fastify — porte do contrato do módulo
// @digimon/decks (lotes 4/5). Feed/likes/cópias/reportes/publicações, legalidade
// e import/export (member) e moderação admin. Leitura aberta a anônimos; escrita
// exige sessão. Erros de domínio delegados ao handler global; composição (DIP)
// vive no container — nenhuma regra de domínio é duplicada aqui.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { UnauthorizedError, ValidationError } from '@digimon/contracts'
import {
  communityModerationActionSchema,
  deckCardSchema,
  isManager,
  listCommunityDecksSchema,
  parseDeckList,
  reportCommunityDeckSchema,
  serializeDeckList
} from '@digimon/decks'
import type {
  Actor,
  CommunityDeck,
  CommunityDeckReport,
  CommunityDeckSummary,
  DeckCardEntry,
  ReportedCommunityDeck
} from '@digimon/decks'
import { communityDecksDeps, decksDeps } from '../container'
import { authenticate, getAuthContext, requireRoleHook } from '../plugins/auth'
import { likeRateLimit, publishRateLimit, reportRateLimit } from './community-rate-limit'

// --- Composição (DIP): factories centralizadas no container -----------------
const community = communityDecksDeps()
const decks = decksDeps()

const MANAGER_HOOK = requireRoleHook(['administrator', 'editor'])

// --- Sessão ----------------------------------------------------------------
/** Ator autenticado (401 via AppError se ausente/inválido). */
function actorFrom(request: FastifyRequest): Actor {
  const context = request.auth ?? getAuthContext(request)
  return { id: context.userId, role: context.role }
}

/** Ator opcional (null se não autenticado), mantendo outros erros. */
function optionalActor(request: FastifyRequest): Actor | null {
  try {
    return actorFrom(request)
  } catch (error) {
    if (error instanceof UnauthorizedError) return null
    throw error
  }
}

// --- Validação de entrada (schemas Zod do módulo) --------------------------
/** Executa o parse do schema e converte ZodError em ValidationError (422). */
function parseInput<T>(parse: () => T): T {
  try {
    return parse()
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'issues' in error
        ? (error as { issues: unknown }).issues
        : undefined
    throw new ValidationError('Dados de entrada inválidos', details)
  }
}

/** Query string → undefined quando ausente/vazia (mesma semântica do web). */
function queryString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return queryString(value[0])
  return String(value)
}

/** `colors=a,b` → ['a', 'b'] (undefined quando vazio). */
function colorList(value: unknown): string[] | undefined {
  const raw = queryString(value)
  if (!raw) return undefined
  const colors = raw.split(',').map((color) => color.trim()).filter((color) => color !== '')
  return colors.length > 0 ? colors : undefined
}

/** Valida uma lista de cartas (cardList/eggList) com o schema do módulo. */
function parseDeckEntries(value: unknown, field: string): DeckCardEntry[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw new ValidationError(`${field} deve ser uma lista de cartas`)
  return value.map((entry) => parseInput(() => deckCardSchema.parse(entry)))
}

// --- Serialização (contrato do módulo; Date → ISO 8601) --------------------
type Timestamps = 'publishedAt' | 'updatedAt'

interface CommunityDeckSummaryDTO extends Omit<CommunityDeckSummary, Timestamps> {
  publishedAt: string
  updatedAt: string
}

interface CommunityDeckDTO extends Omit<CommunityDeck, Timestamps> {
  publishedAt: string
  updatedAt: string
}

interface CommunityDeckReportDTO extends Omit<CommunityDeckReport, 'createdAt' | 'dismissedAt'> {
  createdAt: string
  dismissedAt: string | null
}

interface ReportedCommunityDeckDTO extends Omit<ReportedCommunityDeck, 'lastReportedAt'> {
  lastReportedAt: string
}

function serializeSummary(summary: CommunityDeckSummary): CommunityDeckSummaryDTO {
  return {
    ...summary,
    publishedAt: summary.publishedAt.toISOString(),
    updatedAt: summary.updatedAt.toISOString()
  }
}

function serializeCommunityDeck(deck: CommunityDeck): CommunityDeckDTO {
  return {
    ...deck,
    publishedAt: deck.publishedAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString()
  }
}

function serializeReport(report: CommunityDeckReport): CommunityDeckReportDTO {
  return {
    ...report,
    createdAt: report.createdAt.toISOString(),
    dismissedAt: report.dismissedAt?.toISOString() ?? null
  }
}

function serializeReportedDeck(deck: ReportedCommunityDeck): ReportedCommunityDeckDTO {
  return { ...deck, lastReportedAt: deck.lastReportedAt.toISOString() }
}

export const communityDecksRoutes: FastifyPluginAsync = async (app) => {
  // GET /decks/community — feed público (sort/period/colors/q/page).
  app.get<{ Querystring: Record<string, unknown> }>(
    '/decks/community',
    async (request, reply) => {
      const input = parseInput(() =>
        listCommunityDecksSchema.parse({
          colors: colorList(request.query.colors),
          search: queryString(request.query.q),
          sort: queryString(request.query.sort),
          period: queryString(request.query.period) ?? 'week',
          page: queryString(request.query.page),
          pageSize: queryString(request.query.pageSize)
        })
      )
      const page = await community.list.execute({ input, actor: optionalActor(request) })
      return reply.send({ decks: page.items.map(serializeSummary), hasMore: page.hasMore })
    }
  )

  // GET /decks/community/publications — minhas publicações (autenticado).
  app.get(
    '/decks/community/publications',
    { preHandler: authenticate },
    async (request, reply) => {
      const publications = await community.listPublications.execute({ actor: actorFrom(request) })
      return reply.send(publications)
    }
  )

  // PUT /decks/community/publications/:deckId — publica/atualiza o snapshot.
  app.put<{ Params: { deckId: string } }>(
    '/decks/community/publications/:deckId',
    { preHandler: [authenticate, publishRateLimit] },
    async (request, reply) => {
      const result = await community.publish.execute({
        actor: actorFrom(request),
        slug: request.params.deckId
      })
      return reply.send(result)
    }
  )

  // DELETE /decks/community/publications/:deckId — despublica (204).
  app.delete<{ Params: { deckId: string } }>(
    '/decks/community/publications/:deckId',
    { preHandler: authenticate },
    async (request, reply) => {
      await community.unpublish.execute({
        actor: actorFrom(request),
        slug: request.params.deckId
      })
      return reply.status(204).send()
    }
  )

  // GET /decks/community/:id — detalhe (moderação pode ver hidden).
  app.get<{ Params: { id: string } }>('/decks/community/:id', async (request, reply) => {
    const actor = optionalActor(request)
    const deck = await community.get.execute({
      publicDeckId: request.params.id,
      actor,
      includeHidden: isManager(actor)
    })
    return reply.send(serializeCommunityDeck(deck))
  })

  // PUT /decks/community/:id/like — curtir (autenticado; rate limit).
  app.put<{ Params: { id: string } }>(
    '/decks/community/:id/like',
    { preHandler: [authenticate, likeRateLimit] },
    async (request, reply) => {
      const result = await community.like.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id
      })
      return reply.send(result)
    }
  )

  // DELETE /decks/community/:id/like — descurtir (autenticado).
  app.delete<{ Params: { id: string } }>(
    '/decks/community/:id/like',
    { preHandler: authenticate },
    async (request, reply) => {
      const result = await community.unlike.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id
      })
      return reply.send(result)
    }
  )

  // POST /decks/community/:id/copies — registra cópia (autenticado; 204).
  app.post<{ Params: { id: string } }>(
    '/decks/community/:id/copies',
    { preHandler: authenticate },
    async (request, reply) => {
      await community.copy.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id
      })
      return reply.status(204).send()
    }
  )

  // POST /decks/community/:id/reports — reporta (autenticado; rate limit; 204).
  app.post<{ Params: { id: string }; Body: unknown }>(
    '/decks/community/:id/reports',
    { preHandler: [authenticate, reportRateLimit] },
    async (request, reply) => {
      const input = parseInput(() => reportCommunityDeckSchema.parse(request.body))
      await community.report.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id,
        input
      })
      return reply.status(204).send()
    }
  )

  // POST /decks/legality — valida a composição (member autenticado).
  app.post<{ Body: unknown }>(
    '/decks/legality',
    { preHandler: authenticate },
    async (request, reply) => {
      const body = (request.body ?? {}) as { cardList?: unknown; eggList?: unknown }
      const result = await community.checkLegality.execute({
        cardList: parseDeckEntries(body.cardList, 'cardList'),
        eggList: parseDeckEntries(body.eggList, 'eggList')
      })
      return reply.send(result)
    }
  )

  // POST /decks/import — parse de decklist (member autenticado).
  app.post<{ Body: unknown }>(
    '/decks/import',
    { preHandler: authenticate },
    async (request, reply) => {
      const body = (request.body ?? {}) as { text?: unknown }
      if (typeof body.text !== 'string' || body.text.trim() === '') {
        throw new ValidationError('Texto da decklist é obrigatório')
      }
      const result = await parseDeckList(body.text, community.cardResolver)
      return reply.send(result)
    }
  )

  // GET /decks/:slug/export — decklist DigimonCard.io (dono ou deck público).
  app.get<{ Params: { slug: string } }>('/decks/:slug/export', async (request, reply) => {
    const deck = await decks.get.execute({
      slug: request.params.slug,
      actor: optionalActor(request)
    })
    const text = await serializeDeckList(deck.data, community.cardResolver)
    return reply.header('Content-Type', 'text/plain; charset=utf-8').send(text)
  })

  // POST /admin/decks/community/:id/moderation — hide/restore (administrator|editor).
  app.post<{ Params: { id: string }; Body: unknown }>(
    '/admin/decks/community/:id/moderation',
    { preHandler: [authenticate, MANAGER_HOOK] },
    async (request, reply) => {
      const body = (request.body ?? {}) as { action?: unknown }
      const action = parseInput(() => communityModerationActionSchema.parse(body.action))
      const result = await community.moderate.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id,
        action
      })
      return reply.send({ status: result.status })
    }
  )

  // GET /admin/decks/community/reports — fila de moderação (administrator|editor).
  app.get(
    '/admin/decks/community/reports',
    { preHandler: [authenticate, MANAGER_HOOK] },
    async (request, reply) => {
      const reports = await community.listReported.execute({ actor: actorFrom(request) })
      return reply.send({ decks: reports.map(serializeReportedDeck) })
    }
  )

  // GET /admin/decks/community/:id/reports — reportes abertos (administrator|editor).
  app.get<{ Params: { id: string } }>(
    '/admin/decks/community/:id/reports',
    { preHandler: [authenticate, MANAGER_HOOK] },
    async (request, reply) => {
      const reports = await community.openReports.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id
      })
      return reply.send(reports.map(serializeReport))
    }
  )

  // POST /admin/decks/community/:id/reports/dismiss — dispensa (administrator|editor).
  app.post<{ Params: { id: string } }>(
    '/admin/decks/community/:id/reports/dismiss',
    { preHandler: [authenticate, MANAGER_HOOK] },
    async (request, reply) => {
      const result = await community.dismissReports.execute({
        actor: actorFrom(request),
        publicDeckId: request.params.id
      })
      return reply.send(result)
    }
  )
}
