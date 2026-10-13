// Path: apps/api/src/routes/ads.ts
// Rotas de anúncios em Fastify — bounded context @digimon/ads (público + admin).
// Público: serve os anúncios ativos de um placement (janela de datas + rotação por
// peso) e contabiliza impressões best-effort (ignorando bots/crawlers); o clique é
// best-effort. Admin: leitura por id + CRUD de curadoria (somente administrator).
// Erros de domínio (AppError) são traduzidos pelo handler global. Sem `new
// PrismaClient` aqui — composição no container.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { PaginatedResult } from '@digimon/contracts'
import { NotFoundError } from '@digimon/contracts'
import { requireRole } from '@digimon/auth'
import {
  PUBLIC_ADS_LIMIT,
  createAdSchema,
  listAdsSchema,
  updateAdSchema
} from '@digimon/ads'
import type { Actor, Ad, AdKind, CreateAdInput, UpdateAdInput } from '@digimon/ads'
import { adsDeps } from '../container'
import { getAuthContext } from '../plugins/auth'

// --- Composição (DIP): factories centralizadas no container -----------------
const { repository, list, get, create, update, remove, trackClick } = adsDeps()

// --- Serialização (Date → ISO) ----------------------------------------------
interface AdDTO {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  targetUrl: string
  kind: AdKind
  placements: string[]
  ctaLabel: string | null
  sponsorName: string | null
  disclosure: string | null
  isActive: boolean
  priority: number
  startAt: string | null
  endAt: string | null
  openInNewTab: boolean
  impressions: number
  clicks: number
  createdAt: string
  updatedAt: string
}

function serializeAd(ad: Ad): AdDTO {
  const d = ad.data
  return {
    id: d.id,
    title: d.title,
    subtitle: d.subtitle,
    imageUrl: d.imageUrl,
    targetUrl: d.targetUrl,
    kind: d.kind,
    placements: d.placements,
    ctaLabel: d.ctaLabel,
    sponsorName: d.sponsorName,
    disclosure: d.disclosure,
    isActive: d.isActive,
    priority: d.priority,
    startAt: d.startAt?.toISOString() ?? null,
    endAt: d.endAt?.toISOString() ?? null,
    openInNewTab: d.openInNewTab,
    impressions: d.impressions,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString()
  }
}

function serializeList(result: PaginatedResult<Ad>): PaginatedResult<AdDTO> {
  return {
    items: result.items.map(serializeAd),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize
  }
}

// --- Sessão ------------------------------------------------------------------
/** Ator administrator (curadoria): 401 sem sessão, 403 com papel diferente. */
function requireAdminActor(request: FastifyRequest): Actor {
  const context = getAuthContext(request)
  requireRole(context, 'administrator')
  return { id: context.userId, role: context.role }
}

// --- Anti-bot (impressões) ---------------------------------------------------
// Crawlers/previews/prefetch inflariam `impressions` sem exposição real. Padrão
// documentado: casa User-Agents de bots, previews de redes sociais/mensageiros,
// clientes de linha de comando e runtimes de automação.
const BOT_USER_AGENT_PATTERN = new RegExp(
  'bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|' +
    'preview|headless|curl|wget|python-requests',
  'i'
)

/** True quando o User-Agent casa com o padrão de bots/crawlers acima. */
export function isBotUserAgent(userAgent: string | undefined): boolean {
  return userAgent !== undefined && BOT_USER_AGENT_PATTERN.test(userAgent)
}

// --- Query params ------------------------------------------------------------
/** Teto de anúncios servidos na rotação pública. */
const MAX_PUBLIC_ADS_LIMIT = 10

function queryString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return queryString(value[0])
  return String(value)
}

/** `?limit=` — default PUBLIC_ADS_LIMIT; ausente/inválido cai no default, teto 10. */
function parsePublicLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isInteger(parsed) || parsed <= 0) return PUBLIC_ADS_LIMIT
  return Math.min(parsed, MAX_PUBLIC_ADS_LIMIT)
}

const ADMIN_LIST_KEYS = ['placement', 'kind', 'isActive', 'page', 'pageSize'] as const

export const adsRoutes: FastifyPluginAsync = async (app) => {
  // GET /ads?placement=<p>&limit=<n> — público: anúncios ativos da posição
  // (janela de datas + rotação por peso). Sempre na leitura pública (actor null),
  // independentemente da sessão — a listagem de curadoria vive em /ads/admin.
  app.get<{ Querystring: Record<string, unknown> }>('/ads', async (request, reply) => {
    const input = listAdsSchema.parse({
      placement: queryString(request.query.placement),
      limit: parsePublicLimit(queryString(request.query.limit))
    })
    const result = await list.execute({ input, actor: null })
    const ads = result.items

    // Best-effort: contabiliza as impressões dos servidos sem falhar a resposta.
    // Bots/crawlers/previews não contam — não houve exposição real.
    if (!isBotUserAgent(request.headers['user-agent'])) {
      try {
        await repository.incrementImpressions(ads.map((ad) => ad.id))
      } catch (error) {
        request.log.warn({ err: error }, 'falha ao contabilizar impressões de anúncios')
      }
    }

    return reply.send({ ads: ads.map(serializeAd) })
  })

  // POST /ads/:id/click — público: incrementa clicks (best-effort) → 204; 404 se inexistente.
  app.post<{ Params: { id: string } }>('/ads/:id/click', async (request, reply) => {
    const { tracked } = await trackClick.execute({ id: request.params.id })
    if (!tracked) throw new NotFoundError('Anúncio não encontrado')
    return reply.status(204).send()
  })

  // GET /ads/admin — curadoria: lista todos com filtros (administrator).
  app.get<{ Querystring: Record<string, unknown> }>('/ads/admin', async (request, reply) => {
    const actor = requireAdminActor(request)
    const raw: Record<string, unknown> = {}
    for (const key of ADMIN_LIST_KEYS) {
      raw[key] = queryString(request.query[key])
    }
    const input = listAdsSchema.parse(raw)
    const result = await list.execute({ input, actor })
    return reply.send(serializeList(result))
  })

  // GET /ads/admin/:id — curadoria: leitura por id (administrator) → ad; 404 se ausente.
  app.get<{ Params: { id: string } }>('/ads/admin/:id', async (request, reply) => {
    const actor = requireAdminActor(request)
    const ad = await get.execute({ actor, id: request.params.id })
    return reply.send(serializeAd(ad))
  })

  // POST /ads/admin — cria anúncio (administrator) → 201; validação Zod no use case.
  app.post<{ Body: CreateAdInput }>('/ads/admin', async (request, reply) => {
    const actor = requireAdminActor(request)
    const result = await create.execute({ actor, input: createAdSchema.parse(request.body ?? {}) })
    return reply.status(201).send(result)
  })

  // PATCH /ads/admin/:id — edita anúncio (administrator) → 200.
  app.patch<{ Params: { id: string }; Body: UpdateAdInput }>(
    '/ads/admin/:id',
    async (request, reply) => {
      const actor = requireAdminActor(request)
      const result = await update.execute({
        actor,
        id: request.params.id,
        input: updateAdSchema.parse(request.body ?? {})
      })
      return reply.send(result)
    }
  )

  // DELETE /ads/admin/:id — remove anúncio (administrator) → 204.
  app.delete<{ Params: { id: string } }>('/ads/admin/:id', async (request, reply) => {
    const actor = requireAdminActor(request)
    await remove.execute({ actor, id: request.params.id })
    return reply.status(204).send()
  })
}
